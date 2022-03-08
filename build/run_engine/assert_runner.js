"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const stress_type_1 = require("../common/stress_type");
class AssertRunner {
    static run(record, res, tests) {
        const { envId, assertInfos } = record;
        const infos = _.flatten(_.values(assertInfos)).filter(info => info.env === envId || info.env === 'All' || info.env === stress_type_1.noEnvironment || !info.env);
        infos.forEach(info => {
            try {
                tests[info.name] = this.runAssert(info.target, info.function, info.value, this.getResponseObj(res));
            }
            catch (e) {
                tests[`${info.name}: ${e}`] = false;
            }
        });
    }
    static runAssert(keys, func, value, responseObj) {
        const target = this.getTarget(keys, responseObj);
        let type = typeof target;
        if (this.isLenOper(func)) {
            return eval(`${target['length']} ${func.replace('length', '').trim()} ${value}`);
        }
        else if (this.isCompareOper(func)) {
            if (type === 'number') {
                return eval(`${target} ${func} ${value}`);
            }
            else {
                return eval(`'${target}' ${func} '${value}'`);
            }
        }
        else if (func === 'custom') {
            return eval(`target.${value}`);
        }
        else if (['true', 'false'].find(o => o === func)) {
            return target === (func === 'true' ? true : false);
        }
        else {
            try {
                value = eval(value);
            }
            catch (e) { }
            return eval(target[func](value));
        }
    }
    static getResponseObj(res) {
        let responseObj = {};
        try {
            responseObj = JSON.parse(res.body);
        }
        catch (e) {
            responseObj = e;
        }
        return responseObj;
    }
    static getTarget(keys, responseObj) {
        let target = responseObj;
        for (let i = keys.length - 2; i >= 0; i--) {
            target = target[keys[i]];
        }
        return target;
    }
    static isCompareOper(func) {
        return ['>', '=', '<'].some(o => func.includes(o));
    }
    static isLenOper(func) {
        return func.includes('length');
    }
}
exports.AssertRunner = AssertRunner;
//# sourceMappingURL=assert_runner.js.map