import { npc_data } from "../Tbx/npc_data";
/**
 * @author pumpkye
 */
export class ChessNpcBaseData {
    [index: string]: any;
    baseId = 0;
    name = "";
    quality = 0;
    type = 0;
    /**
     * @description 通过baseId从配置文件中读取数据
     * @param baseId 
     */
    constructor(baseId: number) {
        this.baseId = baseId;
        let tbxData = npc_data[baseId];
        if (tbxData) {
            for (const key in tbxData) {
                if (tbxData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = tbxData[key];
                }
            }

        }
    }


}
