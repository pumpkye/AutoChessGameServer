import { MsgResUserInfo, MsgReqUserInfo } from "../message/UserMsg";
import { g_Connector } from "./connector";

interface User {
    id: number;
    name: string;
}

class UserManager {
    [index: string]: any;
    idSeed: number;
    userList: Map<number, User>;

    constructor() {
        this.init();
    }

    init() {
        this.idSeed = 0;
        this.userList = new Map();
    }

    msgReqUserInfo(msg: MsgReqUserInfo["data"], wsId?: number) {
        console.log(JSON.stringify(msg));
        let id = this.idSeed++;
        let user = { id, name: msg.name };
        this.userList.set(id, user);

        let res = new MsgResUserInfo();
        res.data.name = user.name;
        res.data.id = user.id;
        g_Connector.sendMsg(wsId, res);
    }

    // msgResUserInfo(msg: MsgResUserInfo["data"]) {
    //     this.id = msg.id;
    //     this.name = msg.name;
    //     console.log(`set UserData:: userId:${this.id},userName:${this.name}`);
    // }

}

export const g_UserManager = new UserManager();