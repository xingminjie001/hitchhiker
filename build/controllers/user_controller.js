"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const webapi_router_1 = require("webapi-router");
const user_service_1 = require("../services/user_service");
const Koa = require("koa");
const session_service_1 = require("../services/session_service");
const message_1 = require("../common/message");
const date_util_1 = require("../utils/date_util");
const setting_1 = require("../utils/setting");
const string_util_1 = require("../utils/string_util");
const mail_service_1 = require("../services/mail_service");
const validate_util_1 = require("../utils/validate_util");
class UserController extends webapi_router_1.BaseController {
    register(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_service_1.UserService.createUser(body.name, body.email, body.password);
        });
    }
    tempUse(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = 'test';
            const password = setting_1.Setting.instance.app.defaultPassword;
            const email = `${string_util_1.StringUtil.generateShortId()}${setting_1.Setting.instance.app.tempUser}`;
            yield user_service_1.UserService.createUser(name, email, password, true, true);
            return yield this.login(ctx, { id: '', email, password, name });
        });
    }
    deleteTempUser(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key !== setting_1.Setting.instance.app.tempDelKey) {
                return;
            }
            yield user_service_1.UserService.deleteTempUser();
        });
    }
    login(ctx, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkLogin = yield this.tryLogin(body, false);
            if (!checkLogin.success) {
                return checkLogin;
            }
            session_service_1.SessionService.login(ctx, checkLogin.result.user.id);
            return checkLogin;
        });
    }
    tryLogin(user, isMd5Pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            let checkLogin = yield user_service_1.UserService.checkUser(user.email, user.password, isMd5Pwd);
            if (!checkLogin.success) {
                return checkLogin;
            }
            checkLogin.message = message_1.Message.get('userLoginSuccess');
            checkLogin.result.user.password = undefined;
            return checkLogin;
        });
    }
    getUserInfo(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = ctx.session.user;
            return yield this.tryLogin(user, true);
        });
    }
    logout(ctx) {
        session_service_1.SessionService.logout(ctx);
        return { success: true, message: message_1.Message.get('userLogout') };
    }
    changePwd(ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkRst = validate_util_1.ValidateUtil.checkPassword(info.newPassword);
            if (!checkRst.success) {
                return checkRst;
            }
            const user = ctx.session.user;
            if (user.password !== string_util_1.StringUtil.md5Password(info.oldPassword)) {
                return { success: false, message: message_1.Message.get('userOldPwdIncorrect') };
            }
            return yield user_service_1.UserService.changePwd(user.id, info.newPassword);
        });
    }
    findPwd(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let checkRst = validate_util_1.ValidateUtil.checkEmail(email);
            if (!checkRst.success) {
                return checkRst;
            }
            const user = yield user_service_1.UserService.getUserByEmail(email);
            if (!user) {
                return { success: false, message: message_1.Message.get('userNotExist') };
            }
            const newPwd = string_util_1.StringUtil.generateShortId();
            checkRst = yield user_service_1.UserService.changePwd(user.id, newPwd);
            if (!checkRst.success) {
                return checkRst;
            }
            let rst = { success: true, message: message_1.Message.get('findPwdSuccess') };
            yield mail_service_1.MailService.findPwdMail(email, newPwd).catch(err => rst = { success: false, message: err.message });
            return rst;
        });
    }
    regConfirm(ctx, id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_service_1.UserService.getUserById(id);
            if (!user) {
                return message_1.Message.get('regConfirmFailedUserNotExist');
            }
            if (user.isActive) {
                return message_1.Message.get('regConfirmFailedUserConfirmed');
            }
            const json = string_util_1.StringUtil.decrypt(token);
            const info = JSON.parse(json);
            if (!info || info.host !== setting_1.Setting.instance.appHost) {
                return message_1.Message.get('regConfirmFailedInvalid');
            }
            if (date_util_1.DateUtil.diff(new Date(info.date), new Date()) > 24) {
                return message_1.Message.get('regConfirmFailedExpired');
            }
            user_service_1.UserService.active(user.id);
            ctx.body = message_1.Message.get('regConfirmSuccess');
            ctx.redirect(setting_1.Setting.instance.appHost);
        });
    }
    invite(ctx, emails) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkEmailsRst = validate_util_1.ValidateUtil.checkEmails(emails);
            if (!checkEmailsRst.success) {
                return checkEmailsRst;
            }
            const emailArr = checkEmailsRst.result;
            const user = ctx.session.user;
            const results = yield Promise.all(emailArr.map(email => mail_service_1.MailService.inviterMail(email, user)));
            return { success: results.every(rst => !rst.err), message: results.map(rst => rst.err).join(';') };
        });
    }
}
__decorate([
    webapi_router_1.POST('/user'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    webapi_router_1.POST('/user/temp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "tempUse", null);
__decorate([
    webapi_router_1.DELETE('/user/temp'),
    __param(0, webapi_router_1.QueryParam('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteTempUser", null);
__decorate([
    webapi_router_1.POST(),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    webapi_router_1.GET('/user/me'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserInfo", null);
__decorate([
    webapi_router_1.GET('/user/logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], UserController.prototype, "logout", null);
__decorate([
    webapi_router_1.PUT('/user/password'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePwd", null);
__decorate([
    webapi_router_1.GET('/user/findpwd'),
    __param(0, webapi_router_1.QueryParam('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findPwd", null);
__decorate([
    webapi_router_1.GET('/user/regconfirm'),
    __param(1, webapi_router_1.QueryParam('id')), __param(2, webapi_router_1.QueryParam('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "regConfirm", null);
__decorate([
    webapi_router_1.GET('/user/invite/:emails'),
    __param(1, webapi_router_1.PathParam('emails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "invite", null);
exports.default = UserController;
//# sourceMappingURL=user_controller.js.map