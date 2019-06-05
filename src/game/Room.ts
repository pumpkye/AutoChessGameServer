import { User } from "./User";

import { CardPool } from "./CardPool";
import { RoomConfig } from "../config/GameConfig";

export class Room {
    id: number;
    userMap = new Map<number, User>();
    userCount = 0;
    cardPool: CardPool;
    constructor(id: number) {
        this.id = id;
    }

    update(dt: number) {

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

    startGame() {
        if (!this.cardPool) {
            this.cardPool = new CardPool();
        } else {
            this.cardPool.init();
        }
        this.userMap.forEach((user, userId) => {
            user.init();
            user.cardPool = this.cardPool.getCardGroup(user.level);
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
}