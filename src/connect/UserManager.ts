import { MsgResUserInfo, MsgReqUserInfo } from "../message/UserMsg";
import { g_Connector } from "./connector";
import { MessageBase } from "../message/MessagegBase";

interface User {
    id: number;
    name: string;
    wsId: number;
}

class UserManager {
    [index: string]: any;
    idSeed: number;
    userMap: Map<number, User>;

    constructor() {
        this.init();
    }

    init() {
        this.idSeed = 0;
        this.userMap = new Map();
    }

    addUser(user: User) {
        this.userMap.set(user.id, user);
    }

    removeUser(userId: number) {
        this.userMap.delete(userId);
    }

    getUser(userId: number) {
        return this.userMap.get(userId);
    }

    /**
     * sendMsg的包装方法，用userId代替wsId
     * @param userId 
     * @param msg 
     */
    sendMsgToUser(userId: number, msg: MessageBase) {
        let user = this.userMap.get(userId);
        if (!user) {
            console.log("尝试向一个不存在的user发送消息");
            return;
        }
        let wsId = user.wsId;
        g_Connector.sendMsg(wsId, msg);
    }

    /**
     * 向所有在线玩家广播消息
     */
    sendMsgToWorld(msg: MessageBase) {
        this.userMap.forEach((user, userId) => {
            g_Connector.sendMsg(user.wsId, msg);
        });
    }

    /**
     * 
     * @param msg 
     * @param wsId 
     */
    msgReqUserInfo(msg: MsgReqUserInfo["data"], wsId: number) {
        console.log(JSON.stringify(msg));
        let user;
        for (const e of this.userMap.values()) {
            if (e.wsId == wsId && e.name == msg.name) {
                user = e;
                break;
            }
        }

        if (!user) {
            let id = this.idSeed++;
            user = { id, name: msg.name, wsId };
            this.addUser(user);
            console.log(`创建一个user: ${user}`);
        }

        let res = new MsgResUserInfo();
        res.data.name = user.name;
        res.data.id = user.id;
        g_Connector.sendMsg(wsId, res);
        g_Connector.setWsUserId(wsId, user.id);
    }

}

export const g_UserManager = new UserManager();