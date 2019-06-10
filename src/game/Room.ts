import { User } from "./User";

import { CardPool } from "./CardPool";
import { RoomConfig, RoundConfig, ExpConfig } from "../config/GameConfig";
import { g_UserManager } from "../connect/UserManager";
import { MessageBase } from "../message/MessagegBase";
import { MsgRefreshRoomPlayer, PlayerInfo, MsgRefreshCardPool } from "../message/RoomMsg";

enum RoundState {
    none,
    /**
     * 布局阶段
     */
    layout,
    /**
     * 战斗倒计时
     */
    prepare,
    /**
     * 战斗
     */
    battle,
    /**
     * 战斗结算
     */
    battleEnd,
}
export class Room {
    id: number;
    userMap = new Map<number, User>();
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
        if (!this.cardPool) {
            this.cardPool = new CardPool();
        } else {
            this.cardPool.init();
        }
        this.userMap.forEach((user, userId) => {
            user.init();
            // user.cardPool = this.cardPool.getCardGroup(user.level);
        });

    }

    addUser(userId: number, name?: string) {
        if (this.isGameStart) {
            console.log("游戏已开始")
        }
        if (this.isFull) {
            console.log("房间已满");
            return false;
        }
        let user = new User(userId);
        if (name) {
            user.name = name;
        }
        this.userMap.set(userId, user);
        this.userCount++;
        return true;
    }

    removeUser(userId: number) {
        let ret = this.userMap.delete(userId);
        if (ret) {
            this.userCount--;
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
        });
        this.userMap.forEach((user, userId) => {
            let msg = new MsgRefreshCardPool();
            msg.data.userId = userId;
            msg.data.cardPool = user.getCardPoolArr();
            g_UserManager.sendMsgToUser(userId, msg);
        });
    }

    refreshUserPool(user: User) {
        user.cardPool.forEach((value, key) => {
            this.cardPool.pushBackToCardGroup(value);
        });
        user.cardPool = this.cardPool.getCardGroup(user.level);
    }

    buyCard(userId: number, carIdx: number) {
        let user = this.userMap.get(userId);
        if (user) {
            user.buyCard(carIdx);
        }
    }

    /**
     * 向所有房间内的客户端广播state变化
     */
    boardcastBattleState() {

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
     * 向房间内广播消息
     */
    sendMsgToRoom(msg: MessageBase) {
        this.userMap.forEach((user, userId) => {
            g_UserManager.sendMsgToUser(userId, msg);
        });
    }
}