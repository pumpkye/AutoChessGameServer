"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = require("./Room");
class RoomManager {
    constructor() {
        this.roomIdSeed = 0;
        this.init();
    }
    init() {
        this.roomList = new Array();
    }
    createRoom() {
        this.roomIdSeed++;
        let room = new Room_1.Room(this.roomIdSeed);
        this.roomList[room.id] = room;
        return room.id;
    }
    getRoom(id) {
        this.roomList[id];
    }
    findFreeRoom() {
        for (const roomId in this.roomList) {
            if (this.roomList.hasOwnProperty(roomId)) {
                const room = this.roomList[roomId];
                if (!room.isFull) {
                    return room.id;
                }
            }
        }
        return this.createRoom();
    }
}
exports.g_RoomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map