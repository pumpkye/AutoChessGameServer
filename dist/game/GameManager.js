"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameManager {
    constructor() {
        /**
         * 正在游戏中的room,需要执行update
         */
        this.gameRoom = new Array();
    }
    /**
     * 开启循环
     */
    start() {
        this.timeStamp = new Date().getTime();
        this.schedule = setInterval(function () {
            exports.g_GameManager.update();
        }, 100);
    }
    stop() {
        if (this.schedule) {
            clearInterval(this.schedule);
            this.schedule = null;
        }
    }
    update() {
        let curTimeStamp = new Date().getTime();
        this.dt = curTimeStamp - this.timeStamp;
        this.timeStamp = curTimeStamp;
        for (let i = 0; i < this.gameRoom.length; i++) {
            const room = this.gameRoom[i];
            room.update(this.dt);
        }
    }
    addGameRoom(room) {
        this.gameRoom.push(room);
    }
}
exports.g_GameManager = new GameManager();
//# sourceMappingURL=GameManager.js.map