import webSocket = require('ws');

const WebSocketServer = webSocket.Server;
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