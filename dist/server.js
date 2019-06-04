"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 导入WebSocket模块:
const webSocket = require("ws");
// 引用Server类:
const WebSocketServer = webSocket.Server;
// 实例化:
const wss = new WebSocketServer({
    port: 3001
});
wss.on('connection', function (ws) {
    console.log(`[SERVER] connection()`);
    ws.on('message', function (message) {
        console.log(`[SERVER] Received: ${message}`);
        ws.send(`ECHO: ${message}`, (err) => {
            if (err) {
                console.log(`[SERVER] error: ${err}`);
            }
        });
    });
});
//# sourceMappingURL=server.js.map