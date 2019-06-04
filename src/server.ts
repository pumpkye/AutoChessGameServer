// 导入WebSocket模块:
import webSocket = require('ws');

// 引用Server类:
const WebSocketServer = webSocket.Server;

// 实例化:
const wss = new WebSocketServer({
    port: 3001
});

wss.on('connection', function (ws: any) {
    console.log(`[SERVER] connection()`);
    ws.on('message', function (message: any) {
        console.log(`[SERVER] Received: ${message}`);
        ws.send(`ECHO: ${message}`, (err: any) => {
            if (err) {
                console.log(`[SERVER] error: ${err}`);
            }
        });
    })
});