import webSocket = require('ws');
import { MessageBase } from '../message/MessagegBase';
import { g_UserManager } from './UserManager';

class Connector {
    wss: webSocket.Server;

    wsIdSeed: number;
    wsList: Map<number, webSocket>;
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
        });
    }

    addWs(ws: webSocket) {
        this.wsIdSeed++;
        let id = this.wsIdSeed;
        this.wsList.set(id, ws);
        return id;
    }

    dispatchMsg(wsId: number, data: any) {
        console.log(`dispatchMsg wsId:${wsId},msg:${data}`);
        let msg = JSON.parse(data);
        g_UserManager.msgReqUserInfo(msg.data, wsId);
        // console.log(typeof (g_UserManager[msg.name]));
        // if (typeof (g_UserManager[msg.name]) === "function") {
        //     g_UserManager[msg.name](msg, wsId);
        // }
    }

    sendMsg(wsId: number, msg: MessageBase) {
        console.log(`sendMsg wsId:${wsId}, msg:${JSON.stringify(msg)}`);
        let ws = this.wsList.get(wsId);
        if (!ws || ws.readyState !== webSocket.OPEN) {
            console.log("WebSocket instance wasn't ready...");
            return;
        }
        ws.send(JSON.stringify(msg));
    }
}

export const g_Connector = new Connector();