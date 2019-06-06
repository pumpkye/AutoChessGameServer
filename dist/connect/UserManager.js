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
        this.userList = new Map();
    }
    msgReqUserInfo(msg, wsId) {
        console.log(JSON.stringify(msg));
        let id = this.idSeed++;
        let user = { id, name: msg.name };
        this.userList.set(id, user);
        let res = new UserMsg_1.MsgResUserInfo();
        res.data.name = user.name;
        res.data.id = user.id;
        connector_1.g_Connector.sendMsg(wsId, res);
    }
}
exports.g_UserManager = new UserManager();
//# sourceMappingURL=UserManager.js.map