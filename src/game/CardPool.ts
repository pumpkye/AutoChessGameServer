import { ChessNpcBaseData } from "../tbx_model/ChessNpcBaseData";
import { CardNumConfig, LevelRateConfig } from "../config/GameConfig";
import { g_Util } from "../Util";

export class CardPool {
    //以quality为索引保存每个quality下的card，然后每个baseId的card有多少张就push进去多少个，方便随机
    cardArr: Array<Array<number>>;
    constructor() {
        this.init()
    }

    init() {
        this.cardArr = new Array();
        for (let i = 1; i < 5; i++) {
            this.cardArr[i] = new Array();
        }
        for (let i = 1; i < 25; i++) {
            let baseData = new ChessNpcBaseData(1000 + i);
            let count = CardNumConfig[baseData.quality];
            for (let j = 0; j < count; j++) {
                this.cardArr[baseData.quality].push(1000 + i);
            }
        }
    }

    /**
     * 抽取一组卡
     * @param level 玩家等级
     */
    getCardGroup(level: number) {
        let rateConfig = LevelRateConfig[level];
        let cards = new Map<number, number>();
        //随机五次
        for (let i = 0; i < 5; i++) {
            let rad = g_Util.getRandomNumber(100);
            for (let j = 1; j < 5; j++) {
                rad = rad - rateConfig[j];
                if (rad <= 0) {
                    cards.set(i, this.getCard(j));
                    break;
                }

            }
        }
        return cards;
    }

    getCard(quality: number) {
        let rad = g_Util.getRandomNumber(this.cardArr[quality].length) - 1;
        let baseId = this.cardArr[quality].splice(rad, 1)[0];
        return baseId;
    }

    /**
     * 将玩家卖掉/未购买的卡放回卡池
     * @param baseId 放回卡的baseId
     */
    pushBackToCardGroup(baseId: number) {
        let baseData = new ChessNpcBaseData(baseId);
        if (this.cardArr[baseData.quality]) {
            this.cardArr[baseData.quality].push(baseId);
        }
    }

}
