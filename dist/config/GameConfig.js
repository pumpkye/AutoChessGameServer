"use strict";
/**
 * 游戏配置，加快了游戏节奏，比如1级的时候有2人口，提高了每回合获得金钱和利息倍率
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardNumConfig = {
    //[quality] : cardNum
    [1]: 50,
    [2]: 40,
    [3]: 20,
    [4]: 10,
};
exports.LevelRateConfig = {
    // [level]: {
    //     [quality]: rate,
    // }
    [1]: {
        [1]: 70,
        [2]: 30,
        [3]: 0,
        [4]: 0,
    },
    [2]: {
        [1]: 55,
        [2]: 40,
        [3]: 5,
        [4]: 0,
    },
    [3]: {
        [1]: 45,
        [2]: 45,
        [3]: 10,
        [4]: 0,
    },
    [4]: {
        [1]: 40,
        [2]: 45,
        [3]: 15,
        [4]: 0,
    },
    [5]: {
        [1]: 35,
        [2]: 40,
        [3]: 25,
        [4]: 0,
    },
    [6]: {
        [1]: 30,
        [2]: 35,
        [3]: 30,
        [4]: 5,
    },
    [7]: {
        [1]: 30,
        [2]: 30,
        [3]: 30,
        [4]: 10,
    },
    [8]: {
        [1]: 25,
        [2]: 25,
        [3]: 30,
        [4]: 20,
    },
};
exports.MaxLevel = 8;
exports.LevelCountConfig = {
    //[level]:npcCount
    [1]: 2,
    [2]: 3,
    [3]: 4,
    [4]: 5,
    [5]: 6,
    [6]: 7,
    [7]: 8,
    [8]: 10,
};
exports.LevelExpConfig = {
    //[level]:exp 累计经验
    [1]: 0,
    [2]: 1,
    [3]: 3,
    [4]: 7,
    [5]: 13,
    [6]: 21,
    [7]: 31,
    [8]: 46,
};
exports.ExpConfig = {
    buyCost: 5,
    buyExp: 4,
    everyRound: 1,
};
exports.GoldConfig = {
    /**
     * 最大金钱
     */
    max: 200,
    /**
     * 每回合获得金钱
     */
    everyRound: 8,
    /**
     * 利息倍率，20%
     */
    interestRate: 20,
    /**
     * 每回合最高利息
     */
    maxInterest: 10,
    /**
     * 获胜奖励
     */
    winGold: 2,
    /**
     * 连胜奖励
     */
    winContinue: [0, 1, 2, 3, 4],
    /**
     * 连败补偿
     */
    loseContinue: [0, 1, 2, 3, 4, 5]
};
exports.RoomConfig = {
    /**
     * 同一房间最大玩家数
     */
    maxUser: 8,
};
exports.RoundConfig = {
    roundStateTime: {
        [1]: 60000,
        [2]: 3000,
        [3]: 2000,
        [4]: 1000,
    }
};
//# sourceMappingURL=GameConfig.js.map