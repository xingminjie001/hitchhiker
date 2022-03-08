"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationMode;
(function (NotificationMode) {
    NotificationMode[NotificationMode["none"] = 0] = "none";
    NotificationMode[NotificationMode["me"] = 1] = "me";
    NotificationMode[NotificationMode["project"] = 2] = "project";
    NotificationMode[NotificationMode["custom"] = 3] = "custom";
})(NotificationMode = exports.NotificationMode || (exports.NotificationMode = {}));
class NotificationStr {
    static convert(mode) {
        switch (mode) {
            case NotificationMode.none:
                return NotificationStr.none;
            case NotificationMode.me:
                return NotificationStr.me;
            case NotificationMode.project:
                return NotificationStr.project;
            case NotificationMode.custom:
                return NotificationStr.custom;
            default:
                return NotificationStr.none;
        }
    }
}
NotificationStr.none = 'None';
NotificationStr.me = 'Me';
NotificationStr.project = 'Project Members';
NotificationStr.custom = 'Custom';
exports.NotificationStr = NotificationStr;
var MailMode;
(function (MailMode) {
    MailMode[MailMode["mailAlways"] = 0] = "mailAlways";
    MailMode[MailMode["mailWhenFail"] = 1] = "mailWhenFail";
})(MailMode = exports.MailMode || (exports.MailMode = {}));
//# sourceMappingURL=notification_mode.js.map