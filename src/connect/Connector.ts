import webSocket = require('ws');
import { MessageBase } from '../message/MessagegBase';
import { g_UserManager } from './UserManager';
import { g_RoomManager } from '../game/RoomManager';

class Connector {
    wss: webSocket.Server;

    wsIdSeed: number;
    wsList: Map<number, { ws: webSocket, userId: number }>;

    readonly dispatchList: Array<any> = [
        g_UserManager,
        g_RoomManager,
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
                console.log(`断开链接${id}`);
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
            g_UserManager.disConnectUser(userId);
        }
        //断开连接时仅仅从wsList里删除，只有一局游戏结束时才清理不在线的user
        this.wsList.delete(wsId);
    }

    /**
     * 断开某个连接
     * @param wsId 
     */
    disConnect(wsId: number) {
        let ws = this.wsList.get(wsId);
        if (ws) {
            ws.ws.close();
        }
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
        if (msg.name == "msgReqLogin") {
            g_UserManager.msgReqLogin(msg.data, wsId);
            return;
        }
        //其他消息传递userId
        let userId = this.getWsUserId(wsId);
        if (userId == -1) {
            console.log("ws尚未创建user");
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
            // console.log("WebSocket instance wasn't ready...");
            return;
        }
        ws.send(JSON.stringify(msg));
    }
}

export const g_Connector = new Connector();