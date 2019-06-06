"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChessNpcBaseData_1 = require("../tbx_model/ChessNpcBaseData");
const GameConfig_1 = require("../config/GameConfig");
const Util_1 = require("../Util");
class CardPool {
    constructor() {
        this.init();
    }
    init() {
        this.cardArr = new Array();
        for (let i = 1; i < 5; i++) {
            this.cardArr[i] = new Array();
        }
        for (let i = 1; i < 25; i++) {
            let baseData = new ChessNpcBaseData_1.ChessNpcBaseData(1000 + i);
            let count = GameConfig_1.CardNumConfig[baseData.quality];
            for (let j = 0; j < count; j++) {
                this.cardArr[baseData.quality].push(1000 + i);
            }
        }
    }
    /**
     * 抽取一组卡
     * @param level 玩家等级
     */
    getCardGroup(level) {
        let rateConfig = GameConfig_1.LevelRateConfig[level];
        let cards = new Map();
        //随机五次
        for (let i = 0; i < 5; i++) {
            let rad = Util_1.g_Util.getRandomNumber(100);
            for (let j = 1; j < 5; j++) {
                rad = rad - rateConfig[j];
                if (rad <= 0) {
                    cards.set(i, this.getCard(j));
                }
            }
        }
        return cards;
    }
    getCard(quality) {
        let rad = Util_1.g_Util.getRandomNumber(this.cardArr[quality].length) - 1;
        let baseId = this.cardArr[quality].splice(rad, 1)[0];
        return baseId;
    }
    /**
     * 将玩家卖掉/未购买的卡放回卡池
     * @param baseId 放回卡的baseId
     */
    pushBackToCardGroup(baseId) {
        let baseData = new ChessNpcBaseData_1.ChessNpcBaseData(baseId);
        if (this.cardArr[baseData.quality]) {
            this.cardArr[baseData.quality].push(baseId);
        }
    }
}
exports.CardPool = CardPool;
//# sourceMappingURL=CardPool.js.map