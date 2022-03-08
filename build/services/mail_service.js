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
const setting_1 = require("../utils/setting");
const request = require("request");
const token_service_1 = require("./token_service");
const log_1 = require("../utils/log");
const mail_1 = require("../mail/mail");
class MailService {
    static registerMail(user) {
        const url = `${setting_1.Setting.instance.appApi}user/regconfirm?id=${user.id}&token=${token_service_1.TokenService.buildRegToken()}`;
        const mailReqUrl = `${setting_1.Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${setting_1.Setting.instance.appLanguage}`;
        MailService.sendMailByConfig(() => mail_1.Mail.sendForRegister(user.email, user.name, url, setting_1.Setting.instance.appLanguage), () => MailService.sendMail(mailReqUrl));
    }
    static inviterMail(target, inviter) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${setting_1.Setting.instance.appHost}`;
            const mailReqUrl = `${setting_1.Setting.instance.mail.host}invite?target=${target}&inviter=${inviter.name}&inviteremail=${inviter.email}&url=${encodeURIComponent(url)}&lang=${setting_1.Setting.instance.appLanguage}`;
            return yield MailService.sendMailByConfig(() => mail_1.Mail.sendForInvite(target, `${inviter.name}<${inviter.email}>`, url, setting_1.Setting.instance.appLanguage), () => MailService.sendMail(mailReqUrl));
        });
    }
    static projectInviterMail(targetEmail, inviter, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = token_service_1.TokenService.buildInviteToProjectToken(targetEmail, project.id, inviter.id, inviter.email);
            const acceptUrl = `${setting_1.Setting.instance.appApi}project/join?token=${token}&projectid=${project.id}`;
            const rejectUrl = `${setting_1.Setting.instance.appApi}project/reject?token=${token}&projectid=${project.id}`;
            const mailReqUrl = `${setting_1.Setting.instance.mail.host}inviteToProject?target=${targetEmail}&inviter=${inviter.name}&inviteremail=${inviter.email}&project=${project.name}&accept=${encodeURIComponent(acceptUrl)}&reject=${encodeURIComponent(rejectUrl)}&lang=${setting_1.Setting.instance.appLanguage}`;
            return yield MailService.sendMailByConfig(() => mail_1.Mail.sendForInviteToProject(targetEmail, `${inviter.name}<${inviter.email}>`, project.name, acceptUrl, rejectUrl, setting_1.Setting.instance.appLanguage), () => MailService.sendMail(mailReqUrl));
        });
    }
    static rejectProjectMail(inviterEmail, userEmail, project) {
        const mailReqUrl = `${setting_1.Setting.instance.mail.host}rejectinvite?target=${inviterEmail}&useremail=${userEmail}&project=${project}&lang=${setting_1.Setting.instance.appLanguage}`;
        MailService.sendMailByConfig(() => mail_1.Mail.sendForRejectInvitation(inviterEmail, userEmail, project, setting_1.Setting.instance.appLanguage), () => MailService.sendMail(mailReqUrl));
    }
    static joinProjectMail(inviterEmail, userEmail, project) {
        const joinProjectMailUrl = `${setting_1.Setting.instance.mail.host}acceptinvite?target=${inviterEmail}&useremail=${userEmail}&project=${project}&lang=${setting_1.Setting.instance.appLanguage}`;
        const userInfoMailUrl = `${setting_1.Setting.instance.mail.host}join?target=${userEmail}&password=${setting_1.Setting.instance.app.defaultPassword}&project=${project}&lang=${setting_1.Setting.instance.appLanguage}`;
        MailService.sendMailByConfig(() => {
            return Promise.all([
                mail_1.Mail.sendForAcceptInvitation(inviterEmail, userEmail, project, setting_1.Setting.instance.appLanguage),
                mail_1.Mail.sendUserInfo(userEmail, setting_1.Setting.instance.app.defaultPassword, project, setting_1.Setting.instance.appLanguage)
            ]);
        }, () => {
            return Promise.all([
                MailService.sendMail(joinProjectMailUrl),
                MailService.sendMail(userInfoMailUrl)
            ]);
        });
    }
    static findPwdMail(target, pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailReqUrl = `${setting_1.Setting.instance.mail.host}findpwd?target=${target}&pwd=${pwd}&lang=${setting_1.Setting.instance.appLanguage}`;
            return yield MailService.sendMailByConfig(() => mail_1.Mail.sendForFindPwd(target, pwd, setting_1.Setting.instance.appLanguage), () => MailService.sendMail(mailReqUrl));
        });
    }
    static scheduleMail(targets, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailReqUrl = `${setting_1.Setting.instance.mail.host}schedule?targets=${targets.join(';')}&lang=${setting_1.Setting.instance.appLanguage}`;
            return yield MailService.sendMailByConfig(() => mail_1.Mail.sendForSchedule(targets.join(';'), setting_1.Setting.instance.appLanguage, body), () => MailService.postMail(mailReqUrl, body));
        });
    }
    static sendMailByConfig(customSend, defaultSend) {
        return __awaiter(this, void 0, void 0, function* () {
            if (setting_1.Setting.instance.customMailType === 'none') {
                yield defaultSend();
            }
            else {
                yield customSend();
            }
        });
    }
    static sendMail(url) {
        return MailService.send({ url, headers: { 'content-type': 'application/json' }, method: 'get' });
    }
    static postMail(url, body) {
        return MailService.send({ url, body: JSON.stringify(body), headers: { 'content-type': 'application/json' }, method: 'post' });
    }
    static send(option) {
        return new Promise((resolve, reject) => {
            request(option, (err, response, body) => {
                resolve({ err, response, body });
                if (err) {
                    log_1.Log.error(err);
                }
                else {
                    log_1.Log.info(body);
                }
            });
        });
    }
}
exports.MailService = MailService;
//# sourceMappingURL=mail_service.js.map