"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_util_1 = require("../utils/date_util");
const user_service_1 = require("./user_service");
const user_variable_manager_1 = require("./user_variable_manager");
const string_util_1 = require("../utils/string_util");
class SessionService {
    static get bypass() {
        return [
            'api/user/login$',
            'api/user$',
            'api/user/regconfirm$',
            'api/user/findpwd$',
            'api/project/join$',
            'api/project/reject$',
            '/$',
            '/api/sample(/.*)?',
            '/index.html$',
            'api/user/temp$'
        ];
    }
    static get maxAge() {
        return date_util_1.DateUtil.DAY * 7;
    }
    static login(ctx, userId) {
        ctx.sessionHandler.regenerateId();
        ctx.session.userId = userId;
        ctx.session.date = new Date();
    }
    static logout(ctx) {
        const userId = ctx.session.userId;
        if (ctx.session && ctx.session.userId) {
            user_variable_manager_1.UserVariableManager.clearVariables(ctx.session.userId);
            user_variable_manager_1.UserVariableManager.clearCookies(ctx.session.userId);
        }
        ctx.session = null;
    }
    static isSessionValid(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = ctx.session.userId;
            let validUser = !!userId;
            if (validUser) {
                const checkRst = yield user_service_1.UserService.checkUserById(userId);
                validUser = checkRst.success;
                if (validUser) {
                    ctx.session.user = checkRst.result;
                    ctx.session.userId = userId;
                }
            }
            if (ctx.headers.authorization) {
                const match = string_util_1.StringUtil.checkAutho(ctx.headers.authorization);
                if (match) {
                    const info = Buffer.from(match[1], 'base64').toString();
                    const [user, pwd] = info.split(':');
                    const checkRst = yield user_service_1.UserService.checkUser(user, pwd, false);
                    validUser = checkRst.success;
                }
            }
            return validUser || !!SessionService.bypass.find(o => new RegExp(o, 'g').test(ctx.request.url.replace(`?${ctx.request.querystring}`, '')));
        });
    }
    static rollDate(ctx) {
        const date = SessionService.getDate(ctx);
        if (!date) {
            return;
        }
        if (date_util_1.DateUtil.diff(date, new Date()) > 24) {
            SessionService.updateDate(ctx);
        }
    }
    static updateDate(ctx) {
        ctx.session.date = new Date();
    }
    static getDate(ctx) {
        return ctx.session.date;
    }
    static getUserId(ctx) {
        return ctx.session.userId;
    }
    static getUser(ctx) {
        return ctx.session.user;
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=session_service.js.map