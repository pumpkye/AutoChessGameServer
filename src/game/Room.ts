import { Player } from "./Player";

import { CardPool } from "./CardPool";
import { RoomConfig, RoundConfig, ExpConfig, GoldConfig } from "../config/GameConfig";
import { g_UserManager } from "../connect/UserManager";
import { MessageBase } from "../message/MessagegBase";
import { MsgRefreshRoomPlayer, PlayerInfo, MsgRoundState, MsgResStartGame, RoundState, Result, MsgBattleResult } from "../message/RoomMsg";
import { g_GameManager } from "./GameManager";
import { g_RmBattleManager } from "../remote/RmBattleManager";
import { g_Util } from "../Util";


export class Room {
    id: number;
    /**
     * 房主
     */
    masterId: number;
    playerMap = new Map<number, Player>();
    playerCount = 0;
    cardPool: CardPool;

    isGameStart = false;
    roundIdx: number;
    roundState = RoundState.none;
    roundStateTime: number;

    constructor(id: number) {
        this.id = id;
    }

    update(dt: number) {
        this.roundStateTime -= dt;
        if (this.roundStateTime < 0) {
            this.turnToNextState();
        }
    }

    turnToNextState() {
        if (this.roundState == RoundState.battleEnd) {
            this.roundState = RoundState.none;
            this.roundIdx++;
        }
        this.roundState = this.roundState + 1;
        this.roundStateTime = RoundConfig.roundStateTime[this.roundState];
        switch (this.roundState) {
            case RoundState.layout:
                this.autoAddGoldAndExp();
                this.refreshAllPlayerPool();
                this.boardcastAllPlayer();
                break;
            case RoundState.prepare:
                break;
            case RoundState.battle:
                //todo 调用battleServer计算战斗结果
                this.doBattle();
                break;
            case RoundState.battleEnd:
                break;
            default:
                break;
        }
        this.boardcastBattleState();
    }

    startGame() {
        if (this.playerCount < 2) {
            console.log("房间内人数<2");
            return;
        }
        this.isGameStart = true;
        this.roundIdx = 1;
        this.roundState = RoundState.none;
        this.roundStateTime = 0;

        if (!this.cardPool) {
            this.cardPool = new CardPool();
        } else {
            this.cardPool.init();
        }
        this.playerMap.forEach((player, playerId) => {
            player.init();
        });
        g_GameManager.addGameRoom(this);

        let msg = new MsgResStartGame()
        msg.data.isStart = true;
        this.sendMsgToRoom(msg);
        this.turnToNextState();
    }

    addPlayer(playerId: number, name?: string) {
        if (this.isGameStart) {
            console.log("游戏已开始")
        }
        if (this.isFull) {
            console.log("房间已满");
            return false;
        }
        let player = new Player(playerId, this.id);
        if (name) {
            player.name = name;
        }
        this.playerMap.set(playerId, player);
        this.playerCount++;
        if (this.playerCount == 1) {
            this.masterId = playerId;
        }
        return true;
    }

    removePlayer(playerId: number) {
        let ret = this.playerMap.delete(playerId);
        if (ret) {
            this.playerCount--;
        }
        if (playerId == this.masterId && this.playerCount > 0) {
            for (const player of this.playerMap.values()) {
                this.masterId = player.id;
                break;
            }
        }
    }

    get isFull() {
        return this.playerCount == RoomConfig.maxUser || this.isGameStart;
    }

    autoAddGoldAndExp() {
        this.playerMap.forEach((player, playerId) => {
            player.autoAddGold();
            player.addExp(ExpConfig.everyRound);

        });
    }

    refreshAllPlayerPool() {
        //将所有玩家持有的cardPool内的卡放回卡池
        this.playerMap.forEach((player, playerId) => {
            player.cardPool.forEach((baseId, idx) => {
                this.cardPool.pushBackToCardGroup(baseId);
            });
        });
        this.playerMap.forEach((player, playerId) => {
            player.cardPool = this.cardPool.getCardGroup(player.level);
            player.sendCardPoolToClient();
        });
    }

    reqRefreshPlayerPool(playId: number) {
        let player = this.playerMap.get(playId);
        if (!player) {
            return;
        }
        let ret = player.reduceGold(GoldConfig.refreshPoolCost);
        if (ret) {
            this.refreshPlayerPool(player);
            this.boardcastPlayer(playId);
        }
    }

    refreshPlayerPool(player: Player) {
        player.cardPool.forEach((value, key) => {
            this.cardPool.pushBackToCardGroup(value);
        });
        player.cardPool = this.cardPool.getCardGroup(player.level);
        player.sendCardPoolToClient();
    }

    buyCard(playId: number, carIdx: number) {
        let player = this.playerMap.get(playId);
        if (player) {
            let ret = player.buyCard(carIdx);
            if (ret) {
                //向房间内广播该玩家的手牌变化
                this.boardcastPlayer(playId);
            }
        }
    }

    putNpcToBoard(playerId: number, thisId: number, pos: { x: number, y: number }) {
        let player = this.playerMap.get(playerId);
        if (player) {
            let ret = player.putNpcToBoard(thisId, pos);
            if (ret) {
                this.boardcastPlayer(playerId);
            }
        }
    }

    getBackNpc(playerId: number, thisId: number) {
        let player = this.playerMap.get(playerId);
        if (player) {
            let ret = player.getBackNpc(thisId);
            if (ret) {
                this.boardcastPlayer(playerId);
            }
        }
    }

    moveNpc(playerId: number, thisId: number, pos: { x: number, y: number }) {
        let player = this.playerMap.get(playerId);
        if (player) {
            let ret = player.moveNpc(thisId, pos);
            if (ret) {
                this.boardcastPlayer(playerId);
            }
        }
    }

    /**
     * 向所有房间内的客户端广播state变化
     */
    boardcastBattleState() {
        let msg = new MsgRoundState()
        msg.data.roundIdx = this.roundIdx;
        msg.data.state = this.roundState;
        msg.data.finishTime = g_GameManager.timeStamp + this.roundStateTime;
        this.sendMsgToRoom(msg);
    }

    /**
     * 调用另一台battle服务器计算战斗结果
     */
    doBattle() {
        // let ret = await sendBattle();
        let roomId = this.id;
        let roundIdx = this.roundIdx;
        let matchInfo = this.generateMatch();
        let layoutList = Array();
        this.playerMap.forEach((player, playerId) => {
            let npcList = player.getLayoutListArr();
            layoutList.push({
                playerId,
                npcList,
            });
        });
        g_RmBattleManager.reqBattleResult(roomId, roundIdx, matchInfo, layoutList);
        // this.boardcastBattleResult();
    }

    /**
     * 生成对局，先用简单的纯随机（听说总是匹配到打不过的人？）
     */
    generateMatch() {
        let matchInfo: Array<{ playerAId: number, playerBId: number }> = new Array();
        let tempList = new Array<number>();
        this.playerMap.forEach((player, playerId) => {
            tempList.push(playerId);
        });
        let playerList = new Array<number>();
        let num = tempList.length;
        for (let i = 0; i < num; i++) {
            let rad = g_Util.getRandomNumber(tempList.length);
            playerList.push(tempList[rad - 1]);
            tempList.splice(rad - 1, 1);
        }
        for (let i = 0; i < num; i++) {
            let aId = playerList[i];
            let bId = playerList[i + 1];
            if (i + 1 == num) {
                bId = playerList[0];
            }
            matchInfo.push({ playerAId: aId, playerBId: bId });
        }
        return matchInfo;
    }

    boardcastBattleResult(roundIdx: number, resultList: Array<Result>) {
        if (roundIdx == this.roundIdx) {
            let msg = new MsgBattleResult();
            msg.data.resultList = resultList;
            this.sendMsgToRoom(msg);
        }
    }

    /**
     * 刷新房间内的所有player
     */
    boardcastAllPlayer() {
        let msg = new MsgRefreshRoomPlayer()
        msg.data.roomId = this.id;
        msg.data.refreshAll = true;
        let playerList = new Array();
        this.playerMap.forEach((player, playerId) => {
            let playerInfo: PlayerInfo = {
                id: player.id,
                name: player.name,
                level: player.level,
                exp: player.exp,
                gold: player.gold,
                winContinueCount: player.winContinueCount,
                loseContinueCount: player.loseContinueCount,
                cardList: player.getCardListArr(),
                layoutList: player.getLayoutListArr(),
            }
            playerList.push(playerInfo);
        });
        msg.data.playerList = playerList;
        this.sendMsgToRoom(msg);
    }

    /**
     * 将某个player的信息向房间广播
     */
    boardcastPlayer(playerId: number) {
        let player = this.playerMap.get(playerId);
        if (!player) {
            return;
        }
        let msg = new MsgRefreshRoomPlayer()
        msg.data.roomId = this.id;
        msg.data.refreshAll = false;
        let playerList = new Array();
        let playerInfo: PlayerInfo = {
            id: player.id,
            name: player.name,
            level: player.level,
            exp: player.exp,
            gold: player.gold,
            winContinueCount: player.winContinueCount,
            loseContinueCount: player.loseContinueCount,
            cardList: player.getCardListArr(),
            layoutList: player.getLayoutListArr(),
        }
        playerList.push(playerInfo);
        msg.data.playerList = playerList;
        this.sendMsgToRoom(msg);
    }


    /**
     * 向房间内广播消息
     */
    sendMsgToRoom(msg: MessageBase) {
        this.playerMap.forEach((player, playerId) => {
            g_UserManager.sendMsgToUser(playerId, msg);
        });
    }
}