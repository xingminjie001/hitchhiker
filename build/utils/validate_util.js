"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("../common/message");
class ValidateUtil {
    static checkEmail(email) {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return { success: pattern.test(email), message: message_1.Message.get('userEmailFormatError') };
    }
    static checkEmails(emails) {
        const separator = ';';
        const emailArr = emails instanceof Array ? emails : emails.split(separator);
        if (!emailArr || emailArr.length === 0) {
            return { success: false, message: message_1.Message.get('emailsAtLeastOne') };
        }
        const invalidEmailArr = emailArr.filter(e => !ValidateUtil.checkEmail(e));
        return {
            success: invalidEmailArr.length === 0,
            message: `${message_1.Message.get('userEmailFormatError')}: ${invalidEmailArr.join(';')}`,
            result: emailArr.filter(e => ValidateUtil.checkEmail(e))
        };
    }
    static checkPassword(password) {
        const pattern = /^[\da-zA-Z]{6,16}$/;
        return { success: pattern.test(password), message: message_1.Message.get('userPasswordFormatError') };
    }
    static checkUserName(name) {
        return { success: !!name, message: message_1.Message.get('userNameFormatError') };
    }
    static isResImg(headers) {
        return headers && headers['content-type'] && headers['content-type'].indexOf('image/') >= 0;
    }
}
exports.ValidateUtil = ValidateUtil;
//# sourceMappingURL=validate_util.js.map