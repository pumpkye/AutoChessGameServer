"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserMsg_1 = require("../message/UserMsg");
const connector_1 = require("./connector");
class UserManager {
    constructor() {
        this.init();
    }
    init() {
        this.idSeed = 0;
        this.userMap = new Map();
        this.userArr = new Array();
    }
    addUser(user) {
        this.userMap.set(user.id, user);
        this.userArr[user.id] = user;
    }
    removeUser(userId) {
        delete (this.userArr[userId]);
        this.userMap.delete(userId);
    }
    msgReqUserInfo(msg, wsId) {
        console.log(JSON.stringify(msg));
        let user;
        // for (const userId in this.userArr) {
        //     if (this.userArr.hasOwnProperty(userId)) {
        //         const e = this.userArr[userId];
        //         console.log("循环 查找user");
        //         if (e.wsId == wsId && e.name == msg.name) {
        //             user = e;
        //             console.log("已存在user");
        //             break;
        //         }
        //     }
        // }
        for (const e of this.userMap.values()) {
            console.log("循环 查找user");
            if (e.wsId == wsId && e.name == msg.name) {
                user = e;
                console.log("已存在user");
                break;
            }
        }
        if (!user) {
            console.log("不存在的user");
            let id = this.idSeed++;
            user = { id, name: msg.name, wsId };
            this.addUser(user);
        }
        let res = new UserMsg_1.MsgResUserInfo();
        res.data.name = user.name;
        res.data.id = user.id;
        connector_1.g_Connector.sendMsg(wsId, res);
    }
    /**
     * sendMsg的包装方法，用userId代替wsId
     * @param userId
     * @param msg
     */
    sendMsgToUser(userId, msg) {
        let user = this.userMap.get(userId);
        if (!user) {
            console.log("尝试向一个不存在的user发送消息");
            return;
        }
        let wsId = user.wsId;
        connector_1.g_Connector.sendMsg(wsId, msg);
    }
    /**
     * 向所有在线玩家广播消息
     */
    sendMsgToWorld(msg) {
        this.userMap.forEach((user, userId) => {
            connector_1.g_Connector.sendMsg(user.wsId, msg);
        });
    }
}
exports.g_UserManager = new UserManager();
//# sourceMappingURL=UserManager.js.map