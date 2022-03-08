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
const _ = require("lodash");
const setting_1 = require("../utils/setting");
const sandbox_1 = require("./sandbox");
const log_1 = require("../utils/log");
const { NodeVM: safeVM } = require('vm2');
class ScriptRunner {
    static prerequest(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pid, vid, uid, envId, envName, envVariables, prescript } = record;
            let hitchhiker, res;
            try {
                hitchhiker = new sandbox_1.Sandbox(pid, uid || vid, envId, envName, envVariables, record);
            }
            catch (ex) {
                res = { success: false, message: ex };
            }
            res = yield ScriptRunner.run({ hitchhiker, hh: hitchhiker, hkr: hitchhiker, console: hitchhiker.console }, prescript);
            res.result = { request: hitchhiker.request, consoleMsgQueue: hitchhiker.console.msgQueue };
            return res;
        });
    }
    static test(record, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pid, vid, uid, envId, envName, envVariables, test } = record;
            let hitchhiker, tests;
            try {
                hitchhiker = new sandbox_1.Sandbox(pid, uid || vid, envId, envName, envVariables, record);
            }
            catch (ex) {
                tests = {};
                tests[ex] = false;
            }
            if (!hitchhiker) {
                return { tests, export: undefined, consoleMsgQueue: hitchhiker.console.msgQueue };
            }
            tests = hitchhiker.tests;
            const $variables$ = hitchhiker.variables;
            const $export$ = hitchhiker.export;
            const sandbox = Object.assign({ hitchhiker, hh: hitchhiker, hkr: hitchhiker, $variables$, $export$, tests, console: hitchhiker.console }, ScriptRunner.getInitResObj(res));
            const rst = yield ScriptRunner.run(sandbox, test);
            if (!rst.success) {
                tests[rst.message] = false;
            }
            _.keys(tests).forEach(k => tests[k] = !!tests[k]);
            return { tests, export: hitchhiker.exportObj.content, consoleMsgQueue: hitchhiker.console.msgQueue, error: rst.success ? undefined : rst.message.toString() };
        });
    }
    static run(sandbox, code) {
        let success = true, message = '';
        try {
            code = `module.exports = function(callback) { 
                    void async function() { 
                        let msg;
                        try{
                            ${code || ''};
                        }catch(err){
                            msg = err;
                        }finally{
                            callback(msg);
                        }
                    }(); 
                }`;
            const vm = new safeVM({ timeout: setting_1.Setting.instance.scriptTimeout, sandbox });
            const runWithCallback = vm.run(code);
            return new Promise((resolve, reject) => {
                runWithCallback((err) => {
                    if (err) {
                        log_1.Log.error(err);
                    }
                    resolve({ success: !err, message: err });
                });
            });
            // freeVM.runInContext(code, freeVM.createContext(sandbox), { timeout: 50000 });
        }
        catch (err) {
            success = false;
            message = err;
            log_1.Log.error(err);
        }
        return Promise.resolve({ success, message });
    }
    static getInitResObj(res) {
        let responseObj = {};
        try {
            responseObj = JSON.parse(res.body); // TODO: more response type, xml, protobuf, zip, chunk...
        }
        catch (e) {
            responseObj = e;
        }
        return {
            responseBody: res.body,
            responseCode: { code: res.statusCode, name: res.statusMessage },
            responseObj,
            responseHeaders: res.headers,
            responseTime: res.timingPhases.total >> 0
        };
    }
}
exports.ScriptRunner = ScriptRunner;
//# sourceMappingURL=script_runner.js.map