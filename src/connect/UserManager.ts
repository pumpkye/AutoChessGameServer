import { MsgResUserInfo, MsgReqUserInfo, MsgReqLogin } from "../message/UserMsg";
import { g_Connector } from "./connector";
import { MessageBase } from "../message/MessagegBase";
import { g_RoomManager } from "../game/RoomManager";

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
        console.log(`remove user ${userId}`);
        g_RoomManager.removeUserFromRoom(userId);
        this.userMap.delete(userId);
    }

    disConnectUser(userId: number) {
        console.log(`disconnect user ${userId}`);
        let user = this.userMap.get(userId);
        if (user) {
            user.wsId = -1;
        }
        //如果不在正在游戏的房间内，则删除这个玩家
        let room = g_RoomManager.getUserRoom(userId);
        if (!room || !room.isGameStart) {
            this.removeUser(userId);
        }
    }

    getUser(userId: number) {
        return this.userMap.get(userId);
    }

    clearDisConnectUser(userList: Array<number>) {
        for (let i = 0; i < userList.length; i++) {
            const userId = userList[i];
            let user = this.userMap.get(userId);
            if (user && user.wsId == -1) {
                this.removeUser(userId);
            }
        }
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
        if (wsId == -1) {
            console.log("该user的连接已断开");
            return;
        }
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
            this.idSeed++
            let id = this.idSeed;
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

    msgReqLogin(msg: MsgReqLogin['data'], wsId: number) {
        console.log("使用userId重连");
        let user = this.userMap.get(msg.id);
        if (user) {
            user.wsId = wsId;
            let res = new MsgResUserInfo();
            res.data.name = user.name;
            res.data.id = user.id;
            g_Connector.sendMsg(wsId, res);
            g_Connector.setWsUserId(wsId, user.id);
        }
    }
}

export const g_UserManager = new UserManager();