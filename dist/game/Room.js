"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const CardPool_1 = require("./CardPool");
const GameConfig_1 = require("../config/GameConfig");
const UserManager_1 = require("../connect/UserManager");
var RoundState;
(function (RoundState) {
    RoundState[RoundState["none"] = 0] = "none";
    /**
     * 布局阶段
     */
    RoundState[RoundState["layout"] = 1] = "layout";
    /**
     * 战斗倒计时
     */
    RoundState[RoundState["prepare"] = 2] = "prepare";
    /**
     * 战斗
     */
    RoundState[RoundState["battle"] = 3] = "battle";
    /**
     * 战斗结算
     */
    RoundState[RoundState["battleEnd"] = 4] = "battleEnd";
})(RoundState || (RoundState = {}));
class Room {
    constructor(id) {
        this.userMap = new Map();
        this.userCount = 0;
        this.roundState = RoundState.none;
        this.id = id;
    }
    update(dt) {
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
        this.roundStateTime = GameConfig_1.RoundConfig.roundStateTime[this.roundState];
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
        if (!this.cardPool) {
            this.cardPool = new CardPool_1.CardPool();
        }
        else {
            this.cardPool.init();
        }
        this.userMap.forEach((user, userId) => {
            user.init();
            // user.cardPool = this.cardPool.getCardGroup(user.level);
        });
    }
    addUser(userId, name) {
        if (this.isFull) {
            console.log("房间已满");
            return false;
        }
        let user = new User_1.User(userId);
        if (name) {
            user.name = name;
        }
        this.userMap.set(userId, user);
        this.userCount++;
        return true;
    }
    removeUser(userId) {
        let ret = this.userMap.delete(userId);
        if (ret) {
            this.userCount--;
        }
    }
    get isFull() {
        return this.userCount == GameConfig_1.RoomConfig.maxUser;
    }
    autoAddGoldAndExp() {
        this.userMap.forEach((user, userId) => {
            user.autoAddGold();
            user.addExp(GameConfig_1.ExpConfig.everyRound);
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
    }
    refreshUserPool(user) {
        user.cardPool.forEach((value, key) => {
            this.cardPool.pushBackToCardGroup(value);
        });
        user.cardPool = this.cardPool.getCardGroup(user.level);
    }
    buyCard(userId, carIdx) {
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
     * 向房间内广播消息
     */
    sendMsgToRoom(msg) {
        this.userMap.forEach((user, userId) => {
            UserManager_1.g_UserManager.sendMsgToUser(userId, msg);
        });
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map