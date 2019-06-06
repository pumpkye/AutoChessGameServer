"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessagegBase_1 = require("./MessagegBase");
class MsgReqUserInfo extends MessagegBase_1.MessageBase {
    constructor() {
        super(...arguments);
        this.name = "msgReqUserInfo";
    }
}
exports.MsgReqUserInfo = MsgReqUserInfo;
class MsgResUserInfo extends MessagegBase_1.MessageBase {
    constructor() {
        super(...arguments);
        this.name = "msgResUserInfo";
    }
}
exports.MsgResUserInfo = MsgResUserInfo;
//# sourceMappingURL=UserMsg.js.map