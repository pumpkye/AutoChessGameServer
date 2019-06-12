import { g_Connector } from "./connect/connector";
import { g_GameManager } from "./game/GameManager";

g_Connector.startWebSocketServer();

g_GameManager.start();

console.log("start server on port 3001");