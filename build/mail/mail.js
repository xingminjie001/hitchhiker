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
const template_setting_1 = require("./template_setting");
const request = require("request");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const setting_1 = require("../utils/setting");
const log_1 = require("../utils/log");
const nodeMailer = require("nodemailer");
class Mail {
    static sendForRegister(target, name, url, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = 'register';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang];
            let content = Mail.getContent(type, lang);
            const userName = name || target.substr(0, target.indexOf('@'));
            content = content.replace(/\{\{name\}\}/g, userName).replace(/\{\{url\}\}/g, url);
            return Mail.send(target, title, content);
        });
    }
    static sendForInviteToProject(target, inviter, project, accept, reject, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = 'inviteToProject';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang]
                .replace(/\{\{inviter\}\}/g, inviter)
                .replace(/\{\{project\}\}/g, project);
            let content = Mail.getContent(type, lang);
            content = content.replace(/\{\{inviter\}\}/g, inviter)
                .replace(/\{\{project\}\}/g, project)
                .replace(/\{\{accept\}\}/g, accept)
                .replace(/\{\{reject\}\}/g, reject);
            return yield Mail.send(target, title, content);
        });
    }
    static sendForInvite(target, inviter, url, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = 'invite';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang]
                .replace(/\{\{inviter\}\}/g, inviter);
            let content = Mail.getContent(type, lang);
            content = content.replace(/\{\{inviter\}\}/g, inviter).replace(/\{\{url\}\}/g, url);
            return yield Mail.send(target, title, content);
        });
    }
    static sendForAcceptInvitation(target, user, project, lang) {
        const type = 'acceptInvitation';
        const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang].replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        let content = Mail.getContent(type, lang).replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        return Mail.send(target, title, content);
    }
    static sendForRejectInvitation(target, user, project, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = 'rejectInvitation';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang].replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
            let content = Mail.getContent(type, lang).replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
            return Mail.send(target, title, content);
        });
    }
    static sendForFindPwd(target, pwd, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = 'findPwd';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang];
            let content = Mail.getContent(type, lang).replace(/\{\{pwd\}\}/g, pwd);
            return yield Mail.send(target, title, content);
        });
    }
    static sendUserInfo(target, pwd, project, lang) {
        const type = 'userInfo';
        const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang];
        let content = Mail.getContent(type, lang).replace(/\{\{project\}\}/g, project).replace(/\{\{password\}\}/g, pwd);
        return Mail.send(target, title, content);
    }
    static sendForSchedule(target, lang, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = record.success ? 'scheduleSuccess' : 'scheduleFailed';
            const title = template_setting_1.TemplateSetting.instance.templates[type].title[lang].replace(/\{\{scheduleName\}\}/g, record.scheduleName);
            const content = Mail.getContent(type, lang).replace(/\{\{schedule\}\}/g, record.scheduleName).replace(/\{\{detail\}\}/g, Mail.getScheduleDetail(record));
            return yield Mail.send(target, title, content);
        });
    }
    static getScheduleDetail(record) {
        if (record.runResults.length === 0) {
            return '';
        }
        const rows = record.runResults.map(r => `<tr><td>${r.recordName}</td><td>${r.parameter}</td><td>${r.envName}</td><td>${r.isSuccess}</td><td>${(r.duration / 1000) + 's'}</td><td>${Mail.getRunResultTestDesc(r)}</td><td>${r.error ? r.error.message : ''}</td></tr>`);
        return `<table style="margin-top: 8px;" Width="100%"><tr style="line-height: 40px; background-color: #EEE"><td>Name</td><td>Parameter</td><td>Environment</td><td>Success</td><td>Duration</td><td>Tests</td><td>Error</td></tr>${rows.join('')}</table>`;
    }
    static getRunResultTestDesc(runResult) {
        return `<pre>${_.keys(runResult.tests).map(k => `<div>${k}: <span Style=${runResult.tests[k] ? 'color: green' : 'color: red'}>${runResult.tests[k] ? 'PASS' : 'FAIL'}</span></div>`)}
            </pre>`;
    }
    static send(target, subject, content) {
        if (setting_1.Setting.instance.customMailType === 'api') {
            return Mail.sendWithApi(target, subject, content);
        }
        else {
            return Mail.sendWithSmtp(target, subject, content);
        }
    }
    static sendWithApi(target, subject, content) {
        return new Promise((resolve, reject) => {
            request({ method: 'post', url: setting_1.Setting.instance.customMailApi, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ target, subject, content }) }, (err, response, body) => {
                resolve({ err, response, body });
                if (err) {
                    log_1.Log.error(err);
                }
                else {
                    log_1.Log.info('mail send success');
                }
            });
        });
    }
    static getContent(type, lang) {
        const file = path.join(__dirname, `./templates/${template_setting_1.TemplateSetting.instance.templates[type].template[lang]}`);
        if (!fs.existsSync(file)) {
            console.error(`${file} does not exist`);
        }
        return fs.readFileSync(file, 'utf-8');
    }
    static encode(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }
    static sendWithSmtp(target, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = setting_1.Setting.instance.customMailSmtpFrom || setting_1.Setting.instance.customMailSmtpUser;
            const mailOptions = {
                from: setting_1.Setting.instance.customMailSmtpNickname ? `"${setting_1.Setting.instance.customMailSmtpNickname}" <${from}>` : from,
                to: target.replace(';', ','),
                subject,
                html: content
            };
            return new Promise((resolve, reject) => Mail.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    log_1.Log.error(`mail: ${err.message}`);
                    reject(err);
                }
                else {
                    log_1.Log.info('mail: send mail success');
                    resolve();
                }
            }));
        });
    }
}
Mail.transporter = nodeMailer.createTransport({
    pool: true,
    host: setting_1.Setting.instance.customMailSmtpHost,
    port: setting_1.Setting.instance.customMailSmtpPort,
    secure: setting_1.Setting.instance.customMailSmtpTLS,
    auth: {
        user: setting_1.Setting.instance.customMailSmtpUser,
        pass: setting_1.Setting.instance.customMailSmtpPass
    },
    tls: {
        rejectUnauthorized: setting_1.Setting.instance.customMailSmtpRejectUnauthorized
    }
});
exports.Mail = Mail;
//# sourceMappingURL=mail.js.map