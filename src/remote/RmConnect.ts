import webSocket = require('ws');
import { MessageBase } from '../message/MessagegBase';
import { g_RmBattleManager } from './RmBattleManager';
/**
 * 用于管理服该服务器和其他服务器的连接
 */
const RmConfig = [
    { name: "battleServer", url: "ws://localhost", port: 3100 },
]

class RmConnect {
    serverMap: Map<string, webSocket>;
    dispatchList: Array<any>;
    constructor() {
        this.serverMap = new Map();

    }

    async initConnect() {
        for (let i = 0; i < RmConfig.length; i++) {
            const e = RmConfig[i];
            let url = e.url + ":" + e.port;
            let ret: any = await this.createWsConnect(url);
            if (ret.success) {
                console.log(`connect success: ${e.name}`);
                this.serverMap.set(e.name, ret.ws);
            }
        }
        this.dispatchList = [
            g_RmBattleManager,
        ]
    }

    createWsConnect(url: string) {
        let ws = new webSocket(url);
        ws.onclose = function (event) {
            console.log("connect close");
        }
        ws.onmessage = function (event) {
            console.log("receive server message");
            g_RmConnect.dispatchMsg(event.data);
            // g_MsgHandler.dispatchMsg(event.data);
        }
        return new Promise((resolve, reject) => {
            ws.onopen = function (event) {
                console.log("connect opened");
                resolve({ success: true, ws });
            }
            ws.onerror = function (event) {
                console.log("connect error");
                reject({ success: false, ws });
            }

        })
    }

    dispatchMsg(data: any) {
        console.log(`dispatchMsg:${data}`);
        let msg = JSON.parse(data);
        for (let i = 0; i < this.dispatchList.length; i++) {
            // g_RmBattleManager.rmResBattleResult(msg.data);
            const data = this.dispatchList[i];
            if (typeof (data[msg.name]) === "function") {
                data[msg.name](msg.data);
            }
        }
    }

    sendMsg(serverName: string, msg: MessageBase) {
        let server = this.serverMap.get(serverName);
        if (!server || server.readyState != webSocket.OPEN) {
            console.log("目标服务器连接未准备好");
            return;
        }
        server.send(JSON.stringify(msg));
    }
}

export const g_RmConnect = new RmConnect();