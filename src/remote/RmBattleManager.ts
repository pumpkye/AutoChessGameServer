import { Result, ChessNpcInfo } from "../message/RoomMsg";
import { RmResBattleResult, RmReqBattleResult } from "./remoteMsg/RmBattleMsg";
import { g_RmConnect } from "./RmConnect";
import { g_RoomManager } from "../game/RoomManager";

class RmBattleManager {
    battleIdSeed = 0;
    battleMap: Map<number, BattleInfo>
    constructor() {
        this.battleMap = new Map();
        console.log("init rmbattleManager");
    }

    reqBattleResult(roomId: number, roundIdx: number,
        matchInfo: Array<{
            playerAId: number,
            playerBId: number
        }>,
        layoutList: Array<{
            playerId: number,
            npcList: Array<ChessNpcInfo>,
        }>) {
        this.battleIdSeed++;
        let msg = new RmReqBattleResult();
        msg.data.battleId = this.battleIdSeed;
        msg.data.matchInfo = matchInfo;
        msg.data.layoutList = layoutList;
        g_RmConnect.sendMsg("battleServer", msg);
        let battleInfo: BattleInfo = {
            battleId: msg.data.battleId,
            roomId,
            roundIdx,
            resultList: null,
        }
        this.battleMap.set(msg.data.battleId, battleInfo);
        return this.battleIdSeed;
    }

    rmResBattleResult(msg: RmResBattleResult['data']) {
        console.log("收到返回的消息");
        console.log(msg);
        let battleInfo = this.battleMap.get(msg.battleId);
        if (battleInfo) {
            g_RoomManager.setBattleResult(battleInfo.roomId, battleInfo.roundIdx, msg.resultList);
            this.battleMap.delete(msg.battleId);
        }
    }
}


interface BattleInfo {
    battleId: number,
    roomId: number,
    roundIdx: number,
    resultList: Array<Result>;
}

export const g_RmBattleManager = new RmBattleManager();