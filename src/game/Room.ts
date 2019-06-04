import { User } from "./User";

import { CardPool } from "./CardPool";

export class Room {
    id: number;
    userList: Array<User>;
    cardPool: CardPool;
    constructor(id: number) {
        this.id = id;
        this.userList = new Array();
    }

    addUser(user: User) {
        this.userList.push(user);
    }
}