"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = require("./Room");
class RoomManager {
    constructor() {
        this.roomIdSeed = 0;
        this.init();
    }
    init() {
        this.roomList = new Map();
    }
    createRoom() {
        this.roomIdSeed++;
        let room = new Room_1.Room(this.roomIdSeed);
        this.roomList.set(room.id, room);
        return room.id;
    }
    getRoom(id) {
        return this.roomList.get(id);
    }
    findFreeRoom() {
        this.roomList.forEach((room, roomId) => {
            if (!room.isFull) {
                return roomId;
            }
        });
        return this.createRoom();
    }
}
exports.g_RoomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map