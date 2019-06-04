class Util {
    /**
    * 返回一个[1,num]的随机数
    * @param num 
    */
    public getRandomNumber(num: number): number {
        if (num <= 1) {
            return num;
        }
        let rad = Math.floor(Math.random() * num) + 1;
        return rad;
    }
}

export const g_Util = new Util();