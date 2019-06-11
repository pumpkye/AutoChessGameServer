import { ChessNpcInfo } from "./ChessNpcInfo";
import { LevelExpConfig, ExpConfig, GoldConfig } from "../config/GameConfig";
import { MaxLevel } from "../config/GameConfig";
import { MsgRefreshCardPool } from "../message/RoomMsg";
import { g_UserManager } from "../connect/UserManager";

export class User {
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
        this.level = 1;
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

    moveCardToLayout(idx: number, pos: { x: number, y: number }) {
        //位置有效性
        if (pos.y > 3) {
            console.log("尝试放置棋子到对方半区");
            return false;
        }
        let posEnabled = true;
        this.layoutList.forEach((chessNpcInfo, thisId) => {
            if (chessNpcInfo.pos.x == pos.x && chessNpcInfo.pos.y == pos.y) {
                posEnabled == false;
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
        this.cardPool.delete(idx);
        for (let i = 0; i < 8; i++) {
            if (!this.cardList.get(i)) {
                let npcInfo = new ChessNpcInfo(this.getNewNpcThisId(), baseId, 1, { x: 0, y: 0 });
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
        this.cardList.forEach((npcInfo, idx) => {
            cardArr.push({ idx, npcInfo });
        });
        return cardArr;
    }

    getLayoutListArr() {
        let layoutArr = new Array<ChessNpcInfo>();
        this.layoutList.forEach((chessInfo, thisId) => {
            layoutArr.push(chessInfo);
        });
        return layoutArr;
    }

    getCardPoolArr() {
        let cardArr = new Array<{ idx: number, baseId: number }>();
        this.cardPool.forEach((baseId, idx) => {
            cardArr.push({ idx, baseId });
        });
        return cardArr;
    }
}
