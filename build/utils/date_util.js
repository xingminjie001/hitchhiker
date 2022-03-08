"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateUtil {
    static diff(start, end, unit = 'h', offset = 0) {
        const timeDiff = Math.abs(end.getTime() - start.getTime() + offset);
        return parseInt((timeDiff / (unit === 'h' ? DateUtil.HOUR : DateUtil.MINUTE)) + '');
    }
    static getUTCDate(date) {
        date = date || new Date();
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    }
}
DateUtil.MINUTE = 60 * 1000;
DateUtil.HOUR = 60 * DateUtil.MINUTE;
DateUtil.DAY = 24 * DateUtil.HOUR;
exports.DateUtil = DateUtil;
//# sourceMappingURL=date_util.js.map