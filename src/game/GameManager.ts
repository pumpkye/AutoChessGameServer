import { Room } from "./Room";

class GameManager {
    /**
     * 时间戳
     */
    timeStamp: number;
    /**
     * 当前帧的帧间隔
     */
    dt: number;
    schedule: NodeJS.Timeout;
    /**
     * 正在游戏中的room,需要执行update
     */
    gameRoom = new Array<Room>();
    constructor() {

    }

    /**
     * 开启循环
     */
    start() {
        this.timeStamp = new Date().getTime();
        this.schedule = setInterval(function () {
            g_GameManager.update();
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

    addGameRoom(room: Room) {
        this.gameRoom.push(room);
    }

    removeGameRoom(roomId: number) {
        for (let i = 0; i < this.gameRoom.length; i++) {
            const room = this.gameRoom[i];
            if (room.id == roomId) {
                this.gameRoom.splice(i, 1);
            }
        }
    }
}

export const g_GameManager = new GameManager();