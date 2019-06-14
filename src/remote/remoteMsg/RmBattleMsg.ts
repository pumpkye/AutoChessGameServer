import { MessageBase } from "../../message/MessagegBase";
import { ChessNpcInfo, Result } from "../../message/RoomMsg";

export class RmReqBattleResult extends MessageBase {
    name = "rmReqBattleResult";
    data: {
        //唯一id
        battleId: number;
        matchInfo: Array<{
            playerAId: number,
            playerBId: number,
        }>;
        layoutList: Array<{
            playerId: number,
            npcList: Array<ChessNpcInfo>,
        }>
    }
}

export class RmResBattleResult extends MessageBase {
    name = "rmResBattleResult";
    data: {
        battleId: number;
        resultList: Array<Result>;
    }
}