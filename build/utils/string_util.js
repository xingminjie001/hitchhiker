"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const setting_1 = require("./setting");
const uuid = require("uuid");
const shortId = require("shortid");
const URL = require("url");
const parameter_type_1 = require("../common/parameter_type");
const _ = require("lodash");
const pairwise_1 = require("./pairwise");
class StringUtil {
    static md5(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }
    static md5Password(password) {
        return setting_1.Setting.instance.encryptPassword ? this.md5(password) : password;
    }
    static encrypt(str) {
        const cipher = crypto.createCipher('aes-256-cbc', setting_1.Setting.instance.app.encryptKey);
        let rst = cipher.update(str, 'utf8', 'base64');
        rst += cipher.final('base64');
        return rst;
    }
    static decrypt(str) {
        const decipher = crypto.createDecipher('aes-256-cbc', setting_1.Setting.instance.app.encryptKey);
        let rst = decipher.update(str, 'base64', 'utf8');
        rst += decipher.final('utf8');
        return rst;
    }
    static checkAutho(authorization) {
        return /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/.exec(authorization);
    }
    static applyTemplate(target, variables) {
        let arr = new Array();
        let regex = /{{.*?}}/g;
        let rst;
        while ((rst = regex.exec(target)) !== null) {
            arr.push(rst[0]);
        }
        if (arr.length === 0) {
            return target;
        }
        arr.forEach(o => {
            let key = o.replace('{{', '').replace('}}', '');
            let variable = variables[key];
            if (variable !== undefined) {
                target = target.replace(o, variable);
            }
        });
        return target;
    }
    static generateUID() {
        return `${uuid.v1()}-${shortId.generate()}`;
    }
    static generateShortId() {
        return shortId.generate();
    }
    static getHostFromUrl(url) {
        try {
            return url ? URL.parse(url).hostname : '';
        }
        catch (e) {
            return url;
        }
    }
    static readCookies(cookies) {
        const cookieDict = {};
        cookies.split(';').map(c => c.trim()).forEach(c => cookieDict[c.substr(0, c.indexOf('=') || c.length)] = c);
        return cookieDict;
    }
    static readCookie(cookie) {
        return { key: cookie.substr(0, cookie.indexOf('=') || cookie.length), value: cookie.substr(0, cookie.indexOf(';') || cookie.length) };
    }
    static stringToKeyValues(str) {
        return str.split('\n').map(k => {
            let [key, ...values] = k.split(':');
            const value = values.length === 0 ? undefined : values.join(':');
            return { key, value };
        });
    }
    static fixedEncodeURI(url) {
        try {
            const uri = this.parseUrl(url);
            uri.querys.forEach(q => q.value = q.value == null ? q.value : encodeURIComponent(q.value));
            return this.stringifyUrl(uri.url, uri.querys.map(q => (Object.assign({}, q, { isActive: true }))));
        }
        catch (e) {
            return url;
        }
    }
    static tryAddHttpPrefix(url) {
        const pattern = /^http[s]?:\/\//gi;
        if (!pattern.test(url)) {
            return `http://${url}`;
        }
        return url;
    }
    static fixedEncodeURIComponent(url) {
        return encodeURIComponent(url).replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }
    static verifyParameters(parameters, parameterType) {
        if (parameters === '') {
            return { isValid: false, count: 0, msg: '' };
        }
        let paramObj;
        let count = 0;
        try {
            paramObj = JSON.parse(parameters);
        }
        catch (e) {
            return { isValid: false, count, msg: e.toString() };
        }
        if (Array.isArray(paramObj)) {
            count = paramObj.length;
            return { isValid: true, count, msg: '' };
        }
        if (parameters !== '' && (!_.isPlainObject(paramObj) || !_.values(paramObj).every(p => _.isArray(p)))) {
            return { isValid: false, count, msg: 'Parameters must be a plain object and children must be a array.' };
        }
        const paramArray = _.values(paramObj);
        if (parameterType === parameter_type_1.ParameterType.OneToOne) {
            for (let i = 0; i < paramArray.length; i++) {
                if (i === 0) {
                    count = paramArray[i].length;
                }
                if (paramArray[i].length !== count) {
                    return { isValid: false, count, msg: `The length of OneToOne parameters' children arrays must be identical.` };
                }
            }
        }
        else {
            count = paramArray.length === 0 ? 0 : paramArray.map(p => p.length).reduce((p, c) => p * c);
        }
        return { isValid: true, count, msg: `${count} requests: ` };
    }
    static getParameterArr(paramObj, parameterType, reduceAlgorithm) {
        const paramArr = new Array();
        if (parameterType === parameter_type_1.ParameterType.OneToOne) {
            if (Array.isArray(paramObj)) {
                return paramObj;
            }
            Object.keys(paramObj).forEach((key, index) => {
                for (let i = 0; i < paramObj[key].length; i++) {
                    paramArr[i] = paramArr[i] || {};
                    paramArr[i][key] = paramObj[key][i];
                }
            });
        }
        else if (reduceAlgorithm === parameter_type_1.ReduceAlgorithmType.pairwise) {
            return pairwise_1.PairwiseStrategy.GetTestCasesByObj(paramObj);
        }
        else {
            Object.keys(paramObj).forEach((key, index) => {
                let temp = [...paramArr];
                paramArr.splice(0, paramArr.length);
                for (let i = 0; i < paramObj[key].length; i++) {
                    if (temp.length === 0) {
                        paramArr[i] = paramArr[i] || {};
                        paramArr[i][key] = paramObj[key][i];
                    }
                    else {
                        temp.forEach(t => {
                            paramArr.push(Object.assign({}, t, { [key]: paramObj[key][i] }));
                        });
                    }
                }
            });
        }
        return paramArr;
    }
    static parseParameters(parameters, parameterType, reduceAlgorithm) {
        if (!parameters) {
            return [];
        }
        const { isValid } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType, reduceAlgorithm) : new Array();
        const paramDict = _.keyBy(paramArr, p => StringUtil.toString(p));
        return _.values(paramDict);
    }
    static toString(obj) {
        if (_.isPlainObject(obj) || _.isArray(obj)) {
            return JSON.stringify(obj);
        }
        else {
            return obj ? obj.toString() : '';
        }
    }
    static stringToHeaders(str) {
        return (str || '').split('\n').map(k => {
            let [key, ...values] = k.split(':');
            const value = values.length === 0 ? undefined : values.join(':');
            const isActive = !key.startsWith('//');
            if (!isActive) {
                key = key.substr(2);
            }
            return { isActive, key, value };
        });
    }
    static stringifyUrl(url, querys) {
        const arr = (url || '').split('?');
        if (querys && querys.length) {
            let queryString = '';
            const activeQuerys = querys.filter(q => q.isActive && q.key != null);
            activeQuerys.forEach((q, i) => {
                queryString += `${q.key}${q.value != null ? '=' : ''}${q.value || ''}`;
                if (i !== activeQuerys.length - 1) {
                    queryString += '&';
                }
            });
            return `${arr[0]}${queryString != null ? '?' : ''}${queryString}`;
        }
        return url;
    }
    static parseUrl(url) {
        const arr = url.split('?');
        const result = { url: arr[0], querys: new Array() };
        if (arr.length < 2) {
            return result;
        }
        const queryStr = url.substr(url.indexOf('?'));
        const matchedQueryStr = queryStr === '?' ? '' : _.get(queryStr.match(/^\?([^#]+)/), '[1]');
        if (_.isString(matchedQueryStr)) {
            result.querys = matchedQueryStr.split('&').map(q => {
                let keyValue = q.split('=');
                return {
                    key: _.trim(keyValue[0]) || '',
                    value: keyValue[1] ? q.substr(q.indexOf('=') + 1) : keyValue[1],
                };
            });
        }
        return result;
    }
}
StringUtil.allParameter = 'All';
exports.StringUtil = StringUtil;
//# sourceMappingURL=string_util.js.map