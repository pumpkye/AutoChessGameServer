import { Player } from "./Player";

import { CardPool } from "./CardPool";
import { RoomConfig, RoundConfig, ExpConfig, GoldConfig } from "../config/GameConfig";
import { g_UserManager } from "../connect/UserManager";
import { MessageBase } from "../message/MessagegBase";
import { MsgRefreshRoomPlayer, PlayerInfo, MsgRoundState, MsgResStartGame, RoundState } from "../message/RoomMsg";
import { g_GameManager } from "./GameManager";


export class Room {
    id: number;
    /**
     * 房主
     */
    masterId: number;
    userMap = new Map<number, Player>();
    userCount = 0;
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
                this.refreshAllUserPool();
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
        this.isGameStart = true;
        this.roundIdx = 1;
        this.roundState = RoundState.none;
        this.roundStateTime = 0;

        if (!this.cardPool) {
            this.cardPool = new CardPool();
        } else {
            this.cardPool.init();
        }
        this.userMap.forEach((user, userId) => {
            user.init();
        });
        g_GameManager.addGameRoom(this);

        let msg = new MsgResStartGame()
        msg.data.isStart = true;
        this.sendMsgToRoom(msg);
        this.turnToNextState();
    }

    addUser(userId: number, name?: string) {
        if (this.isGameStart) {
            console.log("游戏已开始")
        }
        if (this.isFull) {
            console.log("房间已满");
            return false;
        }
        let user = new Player(userId, this.id);
        if (name) {
            user.name = name;
        }
        this.userMap.set(userId, user);
        this.userCount++;
        if (this.userCount == 1) {
            this.masterId = userId;
        }
        return true;
    }

    removeUser(userId: number) {
        let ret = this.userMap.delete(userId);
        if (ret) {
            this.userCount--;
        }
        if (userId == this.masterId && this.userCount > 0) {
            for (const user of this.userMap.values()) {
                this.masterId = user.id;
                break;
            }
        }
    }

    get isFull() {
        return this.userCount == RoomConfig.maxUser || this.isGameStart;
    }

    autoAddGoldAndExp() {
        this.userMap.forEach((user, userId) => {
            user.autoAddGold();
            user.addExp(ExpConfig.everyRound);

        });
    }

    refreshAllUserPool() {
        //将所有玩家持有的cardPool内的卡放回卡池
        this.userMap.forEach((user, userId) => {
            user.cardPool.forEach((baseId, idx) => {
                this.cardPool.pushBackToCardGroup(baseId);
            });
        });
        this.userMap.forEach((user, userId) => {
            user.cardPool = this.cardPool.getCardGroup(user.level);
            user.sendCardPoolToClient();
        });
    }

    reqRefreshUserPool(userId: number) {
        let user = this.userMap.get(userId);
        if (!user) {
            return;
        }
        let ret = user.reduceGold(GoldConfig.refreshPoolCost);
        if (ret) {
            this.refreshUserPool(user);
            this.boardcastPlayer(userId);
        }
    }

    refreshUserPool(user: Player) {
        user.cardPool.forEach((value, key) => {
            this.cardPool.pushBackToCardGroup(value);
        });
        user.cardPool = this.cardPool.getCardGroup(user.level);
        user.sendCardPoolToClient();
    }

    buyCard(userId: number, carIdx: number) {
        let user = this.userMap.get(userId);
        if (user) {
            let ret = user.buyCard(carIdx);
            if (ret) {
                //向房间内广播该玩家的手牌变化
                this.boardcastPlayer(userId);
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
    async doBattle() {
        // let ret = await sendBattle();
        this.boardcastBattleResult();
    }

    boardcastBattleResult() {

    }

    /**
     * 刷新房间内的所有player
     */
    boardcastAllPlayer() {
        let msg = new MsgRefreshRoomPlayer()
        msg.data.roomId = this.id;
        msg.data.refreshAll = true;
        let playerList = new Array();
        this.userMap.forEach((user, userId) => {
            let playerInfo: PlayerInfo = {
                id: user.id,
                name: user.name,
                level: user.level,
                exp: user.exp,
                gold: user.gold,
                winContinueCount: user.winContinueCount,
                loseContinueCount: user.loseContinueCount,
                cardList: user.getCardListArr(),
                layoutList: user.getLayoutListArr(),
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
        let player = this.userMap.get(playerId);
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
        this.userMap.forEach((user, userId) => {
            g_UserManager.sendMsgToUser(userId, msg);
        });
    }
}