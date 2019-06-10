"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webSocket = require("ws");
const UserManager_1 = require("./UserManager");
class Connector {
    constructor() {
        this.dispatchList = [
            UserManager_1.g_UserManager,
        ];
        // this.wsIdSeed = 0;
        this.init();
    }
    init() {
        this.wsIdSeed = 0;
        this.wsList = new Map();
    }
    startWebSocketServer() {
        this.wss = new webSocket.Server({
            port: 3001,
        });
        this.wss.on('connection', function (ws) {
            console.log(`connection()`);
            let id = exports.g_Connector.addWs(ws);
            ws.on('message', function (message) {
                exports.g_Connector.dispatchMsg(id, message);
            });
        });
    }
    addWs(ws) {
        this.wsIdSeed++;
        let id = this.wsIdSeed;
        this.wsList.set(id, ws);
        return id;
    }
    dispatchMsg(wsId, data) {
        console.log(`dispatchMsg wsId:${wsId},msg:${data}`);
        let msg = JSON.parse(data);
        for (let i = 0; i < this.dispatchList.length; i++) {
            const data = this.dispatchList[i];
            if (typeof (data[msg.name]) === "function") {
                data[msg.name](msg.data, wsId);
            }
        }
    }
    sendMsg(wsId, msg) {
        console.log(`sendMsg wsId:${wsId}, msg:${JSON.stringify(msg)}`);
        let ws = this.wsList.get(wsId);
        if (!ws || ws.readyState !== webSocket.OPEN) {
            console.log("WebSocket instance wasn't ready...");
            return;
        }
        ws.send(JSON.stringify(msg));
    }
}
exports.g_Connector = new Connector();
//# sourceMappingURL=connector.js.map