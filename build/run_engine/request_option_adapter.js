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
const record_service_1 = require("../services/record_service");
const project_service_1 = require("../services/project_service");
const string_util_1 = require("../utils/string_util");
const setting_1 = require("../utils/setting");
const _ = require("lodash");
const data_mode_1 = require("../common/data_mode");
class RequestOptionAdapter {
    static fromRecord(record, cm) {
        return __awaiter(this, void 0, void 0, function* () {
            cm.push('Apply default headers');
            record = RequestOptionAdapter.applyDefaultHeaders(record);
            if (record.uid) {
                cm.push('Apply localhost mapping');
                yield RequestOptionAdapter.applyLocalhost(record, record.uid);
            }
            const { reqStrictSSL, reqFollowRedirect } = record.collection || { reqStrictSSL: false, reqFollowRedirect: false };
            const option = {
                url: string_util_1.StringUtil.tryAddHttpPrefix(string_util_1.StringUtil.fixedEncodeURI(string_util_1.StringUtil.stringifyUrl(record.url, record.queryStrings))),
                method: record.method,
                headers: record_service_1.RecordService.formatKeyValue(record.headers),
                form: record.dataMode === data_mode_1.DataMode.urlencoded ? record_service_1.RecordService.formatKeyValue(record.formDatas) : undefined,
                body: record.dataMode === data_mode_1.DataMode.urlencoded ? null : record.body,
                strictSSL: reqStrictSSL,
                followRedirect: reqFollowRedirect,
                time: true,
                timeout: setting_1.Setting.instance.requestTimeout,
            };
            if (this.isRequestImg(option.headers)) {
                option.encoding = null;
            }
            cm.push(`Generate request options: ${this.generateOptionInfo(option)}`);
            return option;
        });
    }
    static isRequestImg(headers) {
        const accept = _.keys(headers).find(h => h.toLowerCase() === 'accept');
        return accept && headers[accept].indexOf('image') >= 0;
    }
    static applyLocalhost(record, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /^(http:\/\/|https:\/\/)?localhost(:|\/)/g;
            if (!regex.test(record.url)) {
                return;
            }
            const localhost = yield project_service_1.ProjectService.getLocalhost(userId, record.collection.id);
            record.url = record.url.replace(regex, `$1${localhost}$2`);
            return;
        });
    }
    static generateOptionInfo(option) {
        return `                
                method: ${option.method}
                url: ${option.url}
                headers: ${Object.keys(option.headers || []).map(k => `${k || ''}:${option.headers[k] || ''}`).join('\n                         ')}
                body: ${option.body || ''}
                form: ${JSON.stringify(option.form || '')}
                strictSSL: ${option.strictSSL}
                followRedirect: ${option.followRedirect},
                timeout: ${option.timeout},
                encoding: ${option.encoding || 'none'}`;
    }
}
RequestOptionAdapter.applyDefaultHeaders = (record) => {
    const defaultHeaders = string_util_1.StringUtil.stringToKeyValues(setting_1.Setting.instance.defaultHeaders);
    defaultHeaders.forEach(h => h.isActive = true);
    return Object.assign({}, record, { headers: _.unionBy(record.headers || [], defaultHeaders, 'key') });
};
exports.RequestOptionAdapter = RequestOptionAdapter;
//# sourceMappingURL=request_option_adapter.js.map