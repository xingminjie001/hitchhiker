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
const request_option_adapter_1 = require("./request_option_adapter");
const request = require("request");
const script_runner_1 = require("./script_runner");
const _ = require("lodash");
const string_util_1 = require("../utils/string_util");
const user_variable_manager_1 = require("../services/user_variable_manager");
const header_service_1 = require("../services/header_service");
const collection_service_1 = require("../services/collection_service");
const record_service_1 = require("../services/record_service");
const assert_runner_1 = require("./assert_runner");
const validate_util_1 = require("../utils/validate_util");
const form_data_service_1 = require("../services/form_data_service");
const console_message_1 = require("../services/console_message");
class RecordRunner {
    static runRecords(rs, environmentId, needOrder = false, orderRecordIds = '', applyCookies, trace) {
        return __awaiter(this, void 0, void 0, function* () {
            const cm = console_message_1.ConsoleMessage.create(false);
            const recordExs = yield record_service_1.RecordService.prepareRecordsForRun(rs, environmentId, cm, needOrder ? orderRecordIds : undefined, trace);
            return yield RecordRunner.runRecordExs(recordExs, needOrder, cm);
        });
    }
    static runRecordExs(rs, needOrder, cm, checkNeedStop) {
        return __awaiter(this, void 0, void 0, function* () {
            const runResults = [];
            if (rs.length === 0) {
                return runResults;
            }
            const vid = rs[0].vid;
            if (needOrder) {
                yield RecordRunner.runRecordSeries(rs, runResults, cm, checkNeedStop);
            }
            else {
                yield RecordRunner.runRecordParallel(rs, runResults, cm);
            }
            user_variable_manager_1.UserVariableManager.clearVariables(vid);
            user_variable_manager_1.UserVariableManager.clearCookies(vid);
            return runResults;
        });
    }
    static runRecordSeries(records, runResults, cm, checkNeedStop) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let record of records) {
                if (checkNeedStop && checkNeedStop()) {
                    break;
                }
                const parameters = yield RecordRunner.getParametersWithVariables(record);
                const paramArr = string_util_1.StringUtil.parseParameters(parameters, record.parameterType, record.reduceAlgorithm);
                if (paramArr.length === 0) {
                    runResults.push(yield RecordRunner.runRecordWithVW(record, cm));
                }
                else {
                    // TODO: sync or async ?
                    for (let param of paramArr) {
                        if (checkNeedStop && checkNeedStop()) {
                            break;
                        }
                        let recordEx = RecordRunner.applyReqParameterToRecord(record, param);
                        recordEx = Object.assign({}, recordEx, { param });
                        const runResult = yield RecordRunner.runRecordWithVW(recordEx, cm);
                        runResults.push({ [runResult.param]: runResult });
                    }
                }
            }
        });
    }
    static runRecordParallel(rs, runResults, cm) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(rs.map((r) => __awaiter(this, void 0, void 0, function* () {
                const parameters = yield RecordRunner.getParametersWithVariables(r);
                const paramArr = string_util_1.StringUtil.parseParameters(parameters, r.parameterType, r.reduceAlgorithm);
                let result;
                if (paramArr.length === 0) {
                    result = yield RecordRunner.runRecordWithVW(r, cm);
                    runResults.push(result);
                }
                else {
                    yield Promise.all(paramArr.map((p) => __awaiter(this, void 0, void 0, function* () {
                        let record = RecordRunner.applyReqParameterToRecord(r, p);
                        record = Object.assign({}, record, { param: p });
                        result = yield RecordRunner.runRecordWithVW(record, cm);
                        runResults.push({ [result.param]: result });
                    })));
                }
            })));
        });
    }
    static getParametersWithVariables(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const { uid, vid, envId } = record;
            const variables = user_variable_manager_1.UserVariableManager.getVariables(uid || vid, envId);
            return yield RecordRunner.applyVariables(record.parameters, variables);
        });
    }
    static runRecordFromClient(record, envId, uid, serverRes) {
        return __awaiter(this, void 0, void 0, function* () {
            const cm = console_message_1.ConsoleMessage.create(true);
            cm.push(`Start to run [${record.name}]`);
            if (record.collection && record.collection.id) {
                record.collection = yield collection_service_1.CollectionService.getById(record.collection.id);
            }
            cm.push('Prepare request');
            const recordExs = yield record_service_1.RecordService.prepareRecordsForRun([record], envId, cm);
            cm.push(`Request infos: \n${record_service_1.RecordService.generateRequestInfo(recordExs[0])}`);
            recordExs[0].serverRes = serverRes;
            recordExs[0].uid = uid;
            return yield RecordRunner.runRecordWithVW(recordExs[0], cm);
        });
    }
    static runRecordWithVW(record, cm) {
        return __awaiter(this, void 0, void 0, function* () {
            let prescriptResult = { success: true, message: '' };
            const { uid, vid, envId, param, trace } = record;
            const cookies = user_variable_manager_1.UserVariableManager.getCookies(uid || vid, envId);
            if (record.prescript) {
                cm.push('Run pre request script');
                const data = yield RecordRunner.runPreScript(record);
                prescriptResult = data.prescriptResult || prescriptResult;
                record = data.record;
                if (prescriptResult.result.consoleMsgQueue) {
                    cm.pushArray(prescriptResult.result.consoleMsgQueue || [], true);
                }
                if (!prescriptResult.success) {
                    cm.push(`Script error: ${prescriptResult.message.toString()}`, 'error');
                }
                cm.push(`Request infos: \n${record_service_1.RecordService.generateRequestInfo(record)}`);
            }
            let variables = user_variable_manager_1.UserVariableManager.getVariables(uid || vid, envId);
            cm.push('Apply runtime variables and coodies');
            record = RecordRunner.applyLocalVariables(record, variables);
            record = RecordRunner.applyCookies(record, cookies);
            cm.push(`Request infos: \n${record_service_1.RecordService.generateRequestInfo(record)}`);
            const result = yield RecordRunner.runRecord(record, prescriptResult, cm);
            cm.push('Store runtime variables and cookies');
            RecordRunner.storeVariables(result, variables);
            RecordRunner.storeCookies(result, cookies);
            result.param = string_util_1.StringUtil.toString(param);
            if (trace) {
                trace(JSON.stringify(result));
            }
            cm.push('Complete!');
            return result;
        });
    }
    static runPreScript(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const prescriptResult = yield script_runner_1.ScriptRunner.prerequest(record);
            const { request } = prescriptResult.result;
            if (prescriptResult.success) {
                record = Object.assign({}, record, request, { headers: record_service_1.RecordService.restoreKeyValue(request.headers, header_service_1.HeaderService.fromDto), queryStrings: [], formDatas: record_service_1.RecordService.restoreKeyValue(request.formDatas, form_data_service_1.FormDataService.fromDto) });
            }
            return { prescriptResult, record };
        });
    }
    static storeCookies(result, cookies) {
        if (result.cookies) {
            result.cookies.forEach(c => {
                const keyPair = string_util_1.StringUtil.readCookie(c);
                cookies[keyPair.key] = keyPair.value;
            });
        }
    }
    static applyCookies(record, cookies) {
        if (_.keys(cookies).length === 0) {
            return record;
        }
        let localCookies = cookies;
        let headers = [...record.headers || []];
        const cookieHeader = headers.find(h => h.isActive && (h.key || '').toLowerCase() === 'cookie');
        let recordCookies = {};
        if (cookieHeader) {
            recordCookies = string_util_1.StringUtil.readCookies(cookieHeader.value || '');
            if (_.values(recordCookies).some(c => c === 'nocookie')) {
                localCookies = {};
            }
        }
        const allCookies = Object.assign({}, localCookies, recordCookies);
        _.remove(headers, h => (h.key || '').toLowerCase() === 'cookie');
        headers = Object.keys(allCookies).length > 0 ? [
            ...headers, {
                id: '',
                sort: 0,
                record,
                key: 'Cookie',
                value: _.values(allCookies).join('; '),
                description: '',
                isActive: true,
                isFav: false
            }
        ] : headers;
        return Object.assign({}, record, { headers });
    }
    static storeVariables(result, variables) {
        if (result.variables) {
            _.keys(result.variables).forEach(k => {
                variables[k] = result.variables[k];
            });
        }
    }
    static applyVariablesToKeyValue(keyValues, variables) {
        return (keyValues || []).map(kv => {
            const obj = Object.assign({}, kv);
            obj.key = RecordRunner.applyVariables(kv.key, variables);
            obj.value = RecordRunner.applyVariables(kv.value, variables);
            return obj;
        });
    }
    static applyLocalVariables(record, variables) {
        if (_.keys(variables).length === 0) {
            return record;
        }
        const headers = this.applyVariablesToKeyValue(record.headers, variables);
        const queryStrings = this.applyVariablesToKeyValue(record.queryStrings, variables);
        const formDatas = this.applyVariablesToKeyValue(record.formDatas, variables);
        const assertInfos = {};
        for (let key of Object.keys(record.assertInfos || {})) {
            assertInfos[key] = [];
            for (let info of record.assertInfos[key]) {
                assertInfos[key].push(Object.assign({}, info, { value: RecordRunner.applyVariables(info.value, variables) }));
            }
        }
        return Object.assign({}, record, { headers,
            queryStrings,
            formDatas, url: RecordRunner.applyVariables(record.url, variables), test: RecordRunner.applyVariables(record.test, variables), body: RecordRunner.applyVariables(record.body, variables), prescript: RecordRunner.applyVariables(record.prescript, variables), assertInfos });
    }
    static applyReqParameterToRecord(record, parameter) {
        return Object.assign({}, record, { url: RecordRunner.applyVariables(record.url, parameter), headers: this.applyVariablesToKeyValue(record.headers, parameter), queryStrings: this.applyVariablesToKeyValue(record.queryStrings, parameter), formDatas: this.applyVariablesToKeyValue(record.formDatas, parameter), body: RecordRunner.applyVariables(record.body, parameter), test: RecordRunner.applyVariables(record.test, parameter), prescript: RecordRunner.applyVariables(record.prescript, parameter) });
    }
    static runRecord(record, prescriptResult, cm, needPipe) {
        return __awaiter(this, void 0, void 0, function* () {
            const option = yield request_option_adapter_1.RequestOptionAdapter.fromRecord(record, cm);
            cm.push('Start request');
            const start = process.hrtime();
            const res = yield RecordRunner.request(option, record.serverRes, needPipe);
            const elapsed = process.hrtime(start)[0] * 1000 + _.toInteger(process.hrtime(start)[1] / 1000000);
            cm.push('End request');
            const rst = yield RecordRunner.handleRes(res.response, elapsed, res.err, record, cm, needPipe);
            if (!prescriptResult.success) {
                rst.tests[prescriptResult.message] = false;
            }
            return rst;
        });
    }
    static request(option, serverRes, needPipe) {
        return new Promise((resolve, reject) => {
            const req = request(option, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (needPipe) {
                req.pipe(serverRes);
            }
        });
    }
    static handleRes(res, elapsed, err, record, cm, needPipe) {
        return __awaiter(this, void 0, void 0, function* () {
            const { envId, serverRes } = record;
            cm.push('Run test script');
            const testRst = !err && record.test ? (yield script_runner_1.ScriptRunner.test(record, res)) : { tests: {}, variables: {}, export: {}, consoleMsgQueue: new Array(), error: undefined };
            cm.pushArray(testRst.consoleMsgQueue, true);
            if (testRst.error) {
                cm.push(`Script error: ${testRst.error}`, 'error');
            }
            if (!err && record.assertInfos && Object.keys(record.assertInfos).length > 0) {
                cm.push('Run assert script');
                assert_runner_1.AssertRunner.run(record, res, testRst.tests);
            }
            const pRes = res || {};
            const isImg = validate_util_1.ValidateUtil.isResImg(pRes.headers);
            const duration = RecordRunner.generateDuration(pRes, elapsed);
            cm.push(`Performance: ${this.generateDurationInfo(duration)}`);
            cm.push('Generate response');
            const finalRes = {
                id: record.id,
                envId,
                host: pRes.request ? pRes.request.host : string_util_1.StringUtil.getHostFromUrl(record.url),
                error: err ? { message: err.message, stack: err.stack } : undefined,
                body: isImg ? `data:${pRes.headers['content-type']};base64,${pRes.body.toString('base64')}` : pRes.body,
                tests: testRst.tests,
                variables: {},
                export: testRst.export,
                elapsed: pRes.timingPhases ? pRes.timingPhases.total >> 0 : elapsed,
                duration,
                headers: pRes.headers || {},
                cookies: pRes.headers ? pRes.headers['set-cookie'] : [],
                status: pRes.statusCode,
                statusMessage: pRes.statusMessage,
                consoleMsgQueue: cm.messages
            };
            if (needPipe) {
                const headers = pRes.headers;
                headers['content-length'] = JSON.stringify(finalRes).length + '';
                serverRes.writeHead(pRes.statusCode, pRes.statusMessage, headers);
            }
            return finalRes;
        });
    }
    static generateDuration(pRes, elapsed) {
        const timingPhases = pRes.timingPhases || { wait: 0, dns: 0, total: elapsed };
        const { wait, dns, total } = timingPhases;
        return {
            connect: wait,
            dns,
            request: total - wait - dns
        };
    }
    static generateDurationInfo(duration) {
        return `                
                connect: ${duration.connect}
                dns: ${duration.dns}
                request: ${duration.request}`;
    }
}
RecordRunner.applyVariables = (content, variables) => {
    if (!variables || !content) {
        return content;
    }
    let newContent = content;
    _.keys(variables).forEach(k => {
        newContent = newContent.replace(new RegExp(`{{${k}}}`, 'g'), variables[k] == null ? '' : variables[k]);
    });
    return newContent;
};
exports.RecordRunner = RecordRunner;
//# sourceMappingURL=record_runner.js.map