"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameConfig_1 = require("../config/GameConfig");
const GameConfig_2 = require("../config/GameConfig");
class User {
    constructor(id) {
        this.id = id;
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
    }
    moveCardToLayout(idx, pos) {
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
        let baseId = this.cardList.get(idx);
        this.cardList.delete(idx);
    }
    /**
     * 购买卡片，从carPool移到cardArr
     * @param idx 在卡池中的idx
     */
    buyCard(idx) {
        let baseId = this.cardPool.get(idx);
        if (!baseId) {
            console.log("卡池里没有这张卡");
            return false;
        }
        for (let i = 0; i < 8; i++) {
            if (!this.cardList.get(i)) {
                this.cardList.set(i, baseId);
                return true;
            }
        }
        console.log("卡槽没有位置了");
        return false;
    }
    addExp(exp) {
        if (this.level == GameConfig_2.MaxLevel) {
            console.log("已经是最大等级");
            return false;
        }
        this.exp += exp;
        while (this.exp >= GameConfig_1.LevelExpConfig[this.level + 1]) {
            this.level = this.level + 1;
            if (this.level == GameConfig_2.MaxLevel) {
                this.exp = GameConfig_1.LevelExpConfig[GameConfig_2.MaxLevel];
                break;
            }
        }
        return true;
    }
    buyExp() {
        if (this.gold < GameConfig_1.ExpConfig.buyCost) {
            console.log("金币不够");
            return false;
        }
        if (this.level == GameConfig_2.MaxLevel) {
            console.log("已经是最大等级");
            return false;
        }
        this.gold -= GameConfig_1.ExpConfig.buyCost;
        this.addExp(GameConfig_1.ExpConfig.buyExp);
    }
    /**
     * 每回合开始时自动发钱,工资+利息
     */
    autoAddGold() {
        let interest = Math.min(Math.floor(this.gold * GameConfig_1.GoldConfig.interestRate / 100), GameConfig_1.GoldConfig.maxInterest);
        let gold = interest + GameConfig_1.GoldConfig.everyRound;
        this.addGold(gold);
    }
    addGold(gold) {
        this.gold += gold;
        if (this.gold > GameConfig_1.GoldConfig.max) {
            console.log("已经是最大金钱");
            this.gold = GameConfig_1.GoldConfig.max;
        }
    }
    /**
     * 回合胜利，加钱加连胜次数
     */
    roundWin() {
        this.loseContinueCount = 0;
        this.winContinueCount++;
        let gold = GameConfig_1.GoldConfig.winGold;
        if (this.winContinueCount > GameConfig_1.GoldConfig.winContinue.length) {
            gold += GameConfig_1.GoldConfig.winContinue[GameConfig_1.GoldConfig.winContinue.length - 1];
        }
        else {
            gold += GameConfig_1.GoldConfig.winContinue[this.winContinueCount - 1];
        }
        this.addGold(gold);
    }
    roundLost() {
        this.winContinueCount += 0;
        this.loseContinueCount++;
        let gold = 0;
        if (this.winContinueCount > GameConfig_1.GoldConfig.winContinue.length) {
            gold += GameConfig_1.GoldConfig.winContinue[GameConfig_1.GoldConfig.winContinue.length - 1];
        }
        else {
            gold += GameConfig_1.GoldConfig.winContinue[this.winContinueCount - 1];
        }
        this.addGold(gold);
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map