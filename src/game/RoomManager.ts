import { Room } from "./Room";
import { MsgReqEnterFreeRoom, MsgResEnterRoom, MsgRefreshRoomPlayer, MsgBuyCard, MsgReqStartGame, MsgReqRefreshCardPool, MsgPutNpcToBoard, MsgGetBackNpc, MsgMoveNpc, Result, MsgSellCard, MsgBuyExp } from "../message/RoomMsg";
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

    destroyRoom(roomId: number) {
        this.roomList.delete(roomId);
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
        let ret = room.addPlayer(userId, user.name);
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
        this.userRoomMap.delete(userId);
        if (!room) {
            return;
        }
        room.removePlayer(userId);
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

    setBattleResult(roomId: number, roundIdx: number, resultList: Array<Result>) {
        let room = this.roomList.get(roomId);
        if (!room) {
            return;
        }
        room.calBattleResult(roundIdx, resultList);
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

    msgSellCard(msg: MsgSellCard['data'], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.sellCard(userId, msg.thisId);
    }

    msgReqRefreshCardPool(msg: MsgReqRefreshCardPool["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.reqRefreshPlayerPool(userId);
    }

    msgPutNpcToBoard(msg: MsgPutNpcToBoard["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.putNpcToBoard(userId, msg.thisId, msg.pos);
    }

    msgGetBackNpc(msg: MsgGetBackNpc["data"], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.getBackNpc(userId, msg.thisId);
    }

    msgMoveNpc(msg: MsgMoveNpc['data'], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.moveNpc(userId, msg.thisId, msg.pos);
    }

    msgBuyExp(msg: MsgBuyExp['data'], userId: number) {
        let room = this.getUserRoom(userId);
        if (!room) {
            return;
        }
        room.buyExp(userId);
    }
}

export const g_RoomManager = new RoomManager();