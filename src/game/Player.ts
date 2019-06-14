import { LevelExpConfig, ExpConfig, GoldConfig } from "../config/GameConfig";
import { MaxLevel } from "../config/GameConfig";
import { MsgRefreshCardPool, ChessNpcInfo } from "../message/RoomMsg";
import { g_UserManager } from "../connect/UserManager";
import { ChessNpcBaseData } from "../tbx_model/ChessNpcBaseData";

export class Player {
    id: number;
    roomId: number;
    name: string;
    level: number;
    exp: number;
    gold: number;
    /**
     * 连胜计数
     */
    winContinueCount: number;
    /**
     * 连败计数
     */
    loseContinueCount: number;
    /**
     * 持有的卡,<idx,ChessNpcInfo>
     */
    cardList: Map<number, ChessNpcInfo>;
    /**
     * 布局的npc,<thisId,chessNpcInfo>
     */
    layoutList: Map<number, ChessNpcInfo>;
    /**
     * 个人卡池，即可以购买的卡,<idx,baseId>;
     */
    cardPool: Map<number, number>;

    npcThisIdSeed = 0;

    constructor(id: number, roomId: number) {
        this.id = id;
        this.roomId = roomId;
        this.name = "棋手" + id;
        // this.init();
    }

    /**
     * 每局游戏开始时初始化
     */
    init() {
        this.level = 0;
        this.exp = 0;
        this.gold = 0;
        this.winContinueCount = 0;
        this.loseContinueCount = 0;
        this.cardList = new Map();
        this.layoutList = new Map();
        this.cardPool = new Map();

        this.npcThisIdSeed = 0;
    }

    getNewNpcThisId() {
        this.npcThisIdSeed++;
        return this.npcThisIdSeed;
    }

    /**
     * 从手牌移到棋盘
     * @param thisId 
     * @param pos 
     */
    putNpcToBoard(thisId: number, pos: { x: number, y: number }) {
        let idx = -1;
        for (const info of this.cardList.entries()) {
            if (info[1].thisId == thisId) {
                idx = info[0];
                break;
            }
        }
        if (idx == -1) {
            return false;
        }
        return this.moveCardToLayout(idx, pos);
    }

    moveCardToLayout(idx: number, pos: { x: number, y: number }) {
        //位置有效性
        if (pos.y > 3) {
            console.log("尝试放置棋子到对方半区");
            return false;
        }
        let posEnabled = true;
        this.layoutList.forEach((chessNpcInfo, thisId) => {
            if (chessNpcInfo.pos.x == pos.x && chessNpcInfo.pos.y == pos.y) {
                posEnabled = false;

            }
        });
        if (!posEnabled) {
            console.log("尝试放置到已有棋子的位置上");
            return false;
        }
        let npcInfo = this.cardList.get(idx);
        this.cardList.delete(idx);
        npcInfo.pos = pos;
        this.layoutList.set(npcInfo.thisId, npcInfo);
        this.checkLevelup(npcInfo);
        return true;
    }

    /**
     * 
     * @param npcInfo 新添加到棋盘的npc
     */
    checkLevelup(npcInfo: ChessNpcInfo) {
        if (npcInfo.level == 3) {
            return;
        }
        let sameNpcList;
        let flag = true;
        while (flag) {
            flag = false;
            sameNpcList = new Array();
            for (const npc of this.layoutList.values()) {
                if (npc.baseId == npcInfo.baseId && npc.level == npcInfo.level) {
                    sameNpcList.push(npc.thisId);
                    if (sameNpcList.length >= 3) {
                        let newNpcInfo = this.levelUpNpc(sameNpcList, npcInfo);
                        if (newNpcInfo) {
                            npcInfo = newNpcInfo;
                            flag = true;
                            break;
                        }
                    }
                }
            }
        }
        return;
    }

    /**
     * 将列表中的npc合成升级
     * @param npcList 待升级的npc thisId 列表 
     */
    levelUpNpc(npcList: Array<number>, baseInfo: ChessNpcInfo) {
        if (npcList.length < 3) {
            return null;
        }
        let thisId = this.getNewNpcThisId();
        let npcInfo: ChessNpcInfo = {
            thisId,
            baseId: baseInfo.baseId,
            level: baseInfo.level + 1,
            pos: baseInfo.pos,
        }
        for (let i = 0; i < npcList.length; i++) {
            const thisId = npcList[i];
            this.layoutList.delete(thisId);
        }
        this.layoutList.set(thisId, npcInfo);
        return npcInfo;
    }

    // /**
    //  * 检查场上是否有npc可以三合一
    //  */
    // checkLevelup() {
    //     // let npcList = {
    //     //     [baseId]: {
    //     //         [level]:number,
    //     //     }
    //     // }
    //     let npcList: {
    //         [index: number]: {
    //             [index: number]: Array<number>;
    //         },
    //     };
    //     while (true) {
    //         npcList = {};
    //         //统计各等级npc数量
    //         this.layoutList.forEach((npcInfo, thisId) => {
    //             if (!npcList[npcInfo.baseId]) {
    //                 npcList[npcInfo.baseId] = {};
    //             }
    //             if (!npcList[npcInfo.baseId][npcInfo.level]) {
    //                 npcList[npcInfo.baseId][npcInfo.level] = new Array();
    //             }
    //             npcList[npcInfo.baseId][npcInfo.level].push(npcInfo.thisId);
    //         });
    //         //若存在三个一样的则升级，并且重新统计循环，若不存在则break
    //         for (const baseId in npcList) {
    //             if (npcList.hasOwnProperty(baseId)) {
    //                 const baseIdList = npcList[baseId];
    //                 for (const level in baseIdList) {
    //                     if (baseId.hasOwnProperty(level)) {
    //                         const count = baseIdList[level].length;
    //                         if (count >= 3) {

    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    getBackNpc(thisId: number) {
        let npc = this.layoutList.get(thisId);
        if (!npc) {
            return false;
        }
        for (let i = 0; i < 8; i++) {
            if (!this.cardList.get(i)) {
                this.layoutList.delete(thisId);
                this.cardList.set(i, npc);
                return true;
            }
        }
        return false;
    }

    moveNpc(thisId: number, pos: { x: number, y: number }) {
        let npc = this.layoutList.get(thisId);
        if (!npc) {
            return false;
        }
        //位置有效性
        if (pos.y > 3) {
            console.log("尝试放置棋子到对方半区");
            return false;
        }
        let posEnabled = true;
        this.layoutList.forEach((chessNpcInfo, thisId) => {
            if (chessNpcInfo.pos.x == pos.x && chessNpcInfo.pos.y == pos.y) {
                posEnabled = false;
            }
        });
        if (!posEnabled) {
            console.log("尝试放置到已有棋子的位置上");
            return false;
        }
        npc.pos = pos;
        return true;
    }

    /**
     * 购买卡片，从carPool移到cardArr
     * @param idx 在卡池中的idx
     */
    buyCard(idx: number) {
        let baseId = this.cardPool.get(idx);
        if (!baseId) {
            console.log("卡池里没有这张卡");
            return false;
        }
        let baseData = new ChessNpcBaseData(baseId);
        let ret = this.reduceGold(baseData.quality);
        if (!ret) {
            console.log("金钱不足");
            return;
        }
        this.cardPool.delete(idx);
        for (let i = 0; i < 8; i++) {
            if (!this.cardList.get(i)) {
                let npcInfo = {
                    thisId: this.getNewNpcThisId(),
                    baseId,
                    level: 1,
                    pos: { x: 0, y: 0 },
                }
                // let npcInfo = new ChessNpcInfo(this.getNewNpcThisId(), baseId, 1, { x: 0, y: 0 });
                this.cardList.set(i, npcInfo);
                this.sendCardPoolToClient();
                return true;
            }
        }
        console.log("卡槽没有位置了");
        return false;
    }

    addExp(exp: number) {
        if (this.level == MaxLevel) {
            console.log("已经是最大等级");
            return false;
        }
        this.exp += exp;
        while (this.exp >= LevelExpConfig[this.level + 1]) {
            this.level = this.level + 1;
            if (this.level == MaxLevel) {
                this.exp = LevelExpConfig[MaxLevel];
                break;
            }
        }
        return true;
    }

    buyExp() {
        if (this.gold < ExpConfig.buyCost) {
            console.log("金币不够");
            return false;
        }
        if (this.level == MaxLevel) {
            console.log("已经是最大等级");
            return false;
        }
        this.gold -= ExpConfig.buyCost;
        this.addExp(ExpConfig.buyExp);
    }

    /**
     * 每回合开始时自动发钱,工资+利息
     */
    autoAddGold() {
        let interest = Math.min(Math.floor(this.gold * GoldConfig.interestRate / 100), GoldConfig.maxInterest)
        let gold = interest + GoldConfig.everyRound;
        this.addGold(gold);
    }

    addGold(gold: number) {
        this.gold += gold;
        if (this.gold > GoldConfig.max) {
            console.log("已经是最大金钱");
            this.gold = GoldConfig.max;
        }
    }

    reduceGold(gold: number) {
        if (this.gold < gold) {
            return false;
        }
        this.gold = this.gold - gold;
        return true;
    }

    /**
     * 回合胜利，加钱加连胜次数
     */
    roundWin() {
        this.loseContinueCount = 0;
        this.winContinueCount++;
        let gold = GoldConfig.winGold;
        if (this.winContinueCount > GoldConfig.winContinue.length) {
            gold += GoldConfig.winContinue[GoldConfig.winContinue.length - 1];
        } else {
            gold += GoldConfig.winContinue[this.winContinueCount - 1];
        }
        this.addGold(gold);
    }

    roundLost() {
        this.winContinueCount += 0;
        this.loseContinueCount++;
        let gold = 0;
        if (this.winContinueCount > GoldConfig.winContinue.length) {
            gold += GoldConfig.winContinue[GoldConfig.winContinue.length - 1];
        } else {
            gold += GoldConfig.winContinue[this.winContinueCount - 1];
        }
        this.addGold(gold);
    }

    /**
     * 将卡池内容同步给客户端
     */
    sendCardPoolToClient() {
        let msg = new MsgRefreshCardPool();
        msg.data.userId = this.id;
        msg.data.cardPool = this.getCardPoolArr();
        g_UserManager.sendMsgToUser(this.id, msg);
    }

    /**
     * 将cardList数据按照Array<{ idx: number, npcInfo: ChessNpcInfo }>类型返回
     */
    getCardListArr() {
        let cardArr = new Array<{ idx: number, npcInfo: ChessNpcInfo }>();
        if (this.cardList) {
            this.cardList.forEach((npcInfo, idx) => {
                cardArr.push({ idx, npcInfo });
            });
        }
        return cardArr;
    }

    getLayoutListArr() {
        let layoutArr = new Array<ChessNpcInfo>();
        if (this.layoutList) {
            this.layoutList.forEach((chessInfo, thisId) => {
                layoutArr.push(chessInfo);
            });
        }
        return layoutArr;
    }

    getCardPoolArr() {
        let cardArr = new Array<{ idx: number, baseId: number }>();
        if (this.cardPool) {
            this.cardPool.forEach((baseId, idx) => {
                cardArr.push({ idx, baseId });
            });
        }
        return cardArr;
    }
}
