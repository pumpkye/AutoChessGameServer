"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npc_data_1 = require("../Tbx/npc_data");
/**
 * @author pumpkye
 */
class ChessNpcBaseData {
    /**
     * @description 通过baseId从配置文件中读取数据
     * @param baseId
     */
    constructor(baseId) {
        this.baseId = 0;
        this.name = "";
        this.quality = 0;
        this.type = 0;
        this.baseId = baseId;
        let tbxData = npc_data_1.npc_data[baseId];
        if (tbxData) {
            for (const key in tbxData) {
                if (tbxData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = tbxData[key];
                }
            }
        }
    }
}
exports.ChessNpcBaseData = ChessNpcBaseData;
//# sourceMappingURL=ChessNpcBaseData.js.map