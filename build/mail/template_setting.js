"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TemplateSetting {
    constructor() {
        this._setting = require('../../mail.json');
    }
    get templates() {
        return this._setting.templates;
    }
}
TemplateSetting.instance = new TemplateSetting();
exports.TemplateSetting = TemplateSetting;
//# sourceMappingURL=template_setting.js.map