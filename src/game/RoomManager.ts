import { Room } from "./Room";

class RoomManager {
    roomIdSeed = 0;
    roomList: Map<number, Room>;
    constructor() {
        this.init();
    }
    init() {
        this.roomList = new Map();
    }

    createRoom() {
        this.roomIdSeed++;
        let room = new Room(this.roomIdSeed);
        this.roomList.set(room.id, room);
        return room.id;
    }

    getRoom(id: number) {
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

export const g_RoomManager = new RoomManager();