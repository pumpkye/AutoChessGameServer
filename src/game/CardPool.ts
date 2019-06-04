import { ChessNpcBaseData } from "../tbx_model/ChessNpcBaseData";
import { CardNumConfig, LevelRateConfig } from "../config/GameConfig";
import { g_Util } from "../Util";

export class CardPool {
    cardMap: { [index: number]: number };
    constructor() {

    }

    init() {
        this.cardMap = {}
        for (let i = 1; i < 25; i++) {
            let baseData = new ChessNpcBaseData(1000 + i);
            let count = CardNumConfig[baseData.quality];
            this.cardMap[1000 + i] = count;
        }
    }

    /**
     * 抽取一组卡
     * @param level 玩家等级
     */
    getCardGroup(level: number) {
        let rateConfig = LevelRateConfig[level];
        let cards = new Array();
        //随机五次
        for (let i = 0; i < 5; i++) {
            let rad = g_Util.getRandomNumber(100);
            for (let j = 1; j < 5; j++) {
                rad = rad - rateConfig[j];
                if (rad < 0) {

                }

            }
        }
    }


    getCard(quality: number) {

    }
}
