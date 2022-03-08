"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setting_1 = require("../utils/setting");
const string_util_1 = require("../utils/string_util");
const uuid = require("uuid");
class TokenService {
    static isValidToken(token) {
        return !!TokenService.tokens[encodeURIComponent(token)];
    }
    static removeToken(token) {
        Reflect.deleteProperty(TokenService.tokens, token);
    }
    static buildRegToken() {
        const info = { host: setting_1.Setting.instance.appHost, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;
        return token;
    }
    static buildInviteToProjectToken(userEmail, projectId, inviterId, inviterEmail) {
        const info = { userEmail, inviterId, inviterEmail, projectId, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;
        return token;
    }
    static parseToken(token) {
        const json = string_util_1.StringUtil.decrypt(token);
        const info = JSON.parse(json);
        info.date = new Date(info.date);
        return info;
    }
    static buildToken(info) {
        const text = JSON.stringify(info);
        return encodeURIComponent(string_util_1.StringUtil.encrypt(text));
    }
}
TokenService.tokens = {};
exports.TokenService = TokenService;
//# sourceMappingURL=token_service.js.map