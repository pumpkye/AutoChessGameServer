import { Room } from "./Room";
import { MsgReqEnterFreeRoom, MsgResEnterRoom, MsgRefreshRoomPlayer } from "../message/RoomMsg";
import { g_UserManager } from "../connect/UserManager";

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
        console.log(`创建房间: ${room}`);
        return room.id;
    }

    getRoom(id: number) {
        return this.roomList.get(id);
    }

    findFreeRoom() {
        for (const room of this.roomList.values()) {
            if (!room.isFull) {
                return room.id;
            }
        }
        return this.createRoom();
    }

    msgReqEnterFreeRoom(msg: MsgReqEnterFreeRoom["data"], userId: number) {
        let roomId = this.findFreeRoom();
        let room = this.getRoom(roomId);
        let user = g_UserManager.getUser(userId);
        let ret = room.addUser(userId, user.name);
        if (ret) {
            let res = new MsgResEnterRoom();
            res.data.roomId = roomId;
            g_UserManager.sendMsgToUser(userId, res);
            room.boardcastAllPlayer();
        }
    }


}

export const g_RoomManager = new RoomManager();