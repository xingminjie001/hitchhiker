"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setting_1 = require("../utils/setting");
class Message {
    static get(id) {
        return (this[setting_1.Setting.instance.appLanguage] || this['en'])[id];
    }
}
Message.en = require('../locales/en.json');
Message.zh = require('../locales/zh.json');
exports.Message = Message;
//# sourceMappingURL=message.js.map