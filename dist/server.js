"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webSocket = require("ws");
const WebSocketServer = webSocket.Server;
const wss = new WebSocketServer({
    port: 3001
});
wss.on('connection', function (ws) {
    console.log(`[SERVER] connection()`);
    let userId = 0;
    ws.on('message', function (message) {
        console.log(`[SERVER] Received: ${message}`);
        let msg = JSON.parse(message);
        if (msg.name == "addUser") {
            userId = msg.id;
            ws.send(`addUser:${userId}`);
        }
        else {
            ws.send(`${userId}:${message},ret time ${new Date().getTime()}`);
        }
        // ws.send(`ECHO: ${message}`, (err: any) => {
        //     if (err) {
        //         console.log(`[SERVER] error: ${err}`);
        //     }
        // });
    });
});
//# sourceMappingURL=server.js.map