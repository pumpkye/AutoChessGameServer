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
        }, 250);

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


    }

    addGameRoom(room: Room) {
        this.gameRoom.push(room);
    }
}

export const g_GameManager = new GameManager();