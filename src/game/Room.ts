import { User } from "./User";

import { CardPool } from "./CardPool";
import { RoomConfig, RoundConfig, ExpConfig } from "../config/GameConfig";

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
        return this.userCount == RoomConfig.maxUser;
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
     * 依据之前的统计：一颗i5-8400单核单线程每秒可以计算8人口对局300场
     */
    async doBattle() {
        // let ret = await sendBattle();
        this.boardcastBattleResult();
    }

    boardcastBattleResult() {

    }
}