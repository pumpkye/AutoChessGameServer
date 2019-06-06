"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    /**
    * 返回一个[1,num]的随机数
    * @param num
    */
    getRandomNumber(num) {
        if (num <= 1) {
            return num;
        }
        let rad = Math.floor(Math.random() * num) + 1;
        return rad;
    }
}
exports.g_Util = new Util();
//# sourceMappingURL=Util.js.map