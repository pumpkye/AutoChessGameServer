import webSocket = require('ws');
import { MessageBase } from '../message/MessagegBase';
import { g_UserManager } from './UserManager';

class Connector {
    wss: webSocket.Server;

    wsIdSeed: number;
    wsList: Map<number, { ws: webSocket, userId: number }>;

    readonly dispatchList: Array<any> = [
        g_UserManager,
    ];
    constructor() {
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
            let id = g_Connector.addWs(ws);
            ws.on('message', function (message: any) {
                g_Connector.dispatchMsg(id, message);
            })
            ws.on('close', function () {
                g_Connector.removeWs(id);
            })
        });
    }

    addWs(ws: webSocket) {
        this.wsIdSeed++;
        let id = this.wsIdSeed;
        this.wsList.set(id, { ws, userId: -1 });
        return id;
    }

    removeWs(wsId: number) {
        let userId = this.getWsUserId(wsId);
        if (userId) {
            g_UserManager.removeUser(userId);
        }
        this.wsList.delete(wsId);
    }

    setWsUserId(wsId: number, userId: number) {
        let ws = this.wsList.get(wsId);
        if (ws) {
            ws.userId = userId;
        }
    }

    getWsUserId(wsId: number) {
        let ws = this.wsList.get(wsId);
        if (ws) {
            return ws.userId;
        }
        return -1;
    }

    dispatchMsg(wsId: number, data: any) {
        console.log(`dispatchMsg wsId:${wsId},msg:${data}`);
        let msg = JSON.parse(data);
        //建立socket之后的第一条消息，dispatch的时候传递wsId
        if (msg.name === "msgReqUserInfo") {
            g_UserManager.msgReqUserInfo(msg.data, wsId);
            return;
        }
        //其他消息传递userId
        let userId = this.getWsUserId(wsId);
        if (userId == -1) {
            return;
        }
        for (let i = 0; i < this.dispatchList.length; i++) {
            const data = this.dispatchList[i];
            if (typeof (data[msg.name]) === "function") {
                data[msg.name](msg.data, userId);
            }
        }
    }

    sendMsg(wsId: number, msg: MessageBase) {
        console.log(`sendMsg wsId:${wsId}, msg:${JSON.stringify(msg)}`);
        let ws = this.wsList.get(wsId) && this.wsList.get(wsId).ws;
        if (!ws || ws.readyState !== webSocket.OPEN) {
            console.log("WebSocket instance wasn't ready...");
            return;
        }
        ws.send(JSON.stringify(msg));
    }
}

export const g_Connector = new Connector();