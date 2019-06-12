import { Room } from "./Room";
import { MsgReqEnterFreeRoom, MsgResEnterRoom, MsgRefreshRoomPlayer, MsgBuyCard, MsgReqStartGame, MsgReqRefreshCardPool } from "../message/RoomMsg";
import { g_UserManager } from "../connect/UserManager";

class RoomManager {
    roomIdSeed = 0;
    roomList: Map<number, Room>;
    /**
     * userId和roomId的映射表，记录user所在的room
     */
    userRoomMap: Map<number, number>;
    constructor() {
        this.init();
    }
    init() {
        this.roomList = new Map();
        this.userRoomMap = new Map();
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
            this.userRoomMap.set(userId, roomId);

            let res = new MsgResEnterRoom();
            res.data.roomId = roomId;
            g_UserManager.sendMsgToUser(userId, res);
            room.boardcastAllPlayer();
        }
    }

    removeUserFromRoom(userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.removeUser(userId);
        this.userRoomMap.delete(userId);
    }

    getUserRoom(userId: number) {
        let roomId = this.userRoomMap.get(userId);
        if (!roomId) {
            console.log("未查找到该玩家的房间id");
            return;
        }
        let room = this.roomList.get(roomId);
        if (!room) {
            console.log("未查找到该玩家的房间");
            return;
        }
        return room;
    }

    msgReqStartGame(msg: MsgReqStartGame["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        if (room.masterId == userId) {
            room.startGame();
        } else {
            console.log("只有房主才能开始游戏");
        }
    }

    msgBuyCard(msg: MsgBuyCard["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.buyCard(userId, msg.idx);
    }

    msgReqRefreshCardPool(msg: MsgReqRefreshCardPool["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.reqRefreshUserPool(userId);
    }
}

export const g_RoomManager = new RoomManager();