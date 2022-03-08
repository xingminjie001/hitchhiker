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
require("reflect-metadata");
const setting_1 = require("../../utils/setting");
const log_1 = require("../../utils/log");
const WS = require("ws");
const _ = require("lodash");
const stress_type_1 = require("../../common/stress_type");
const stress_record_service_1 = require("../../services/stress_record_service");
const stress_record_1 = require("../../models/stress_record");
const stress_1 = require("../../models/stress");
const stress_failed_info_1 = require("../../models/stress_failed_info");
const stress_service_1 = require("../../services/stress_service");
const string_util_1 = require("../../utils/string_util");
const math_util_1 = require("../../utils/math_util");
const goDurationRate = isGoNode() ? 1000000 : 1;
const workers = {};
const stressQueue = [];
const users = {};
let stressReqDuration = {};
let stressFailedResult = { m500: {}, testFailed: {}, noRes: {} };
let currentStressRequest;
let startTime;
log_1.Log.init();
log_1.Log.info('stress process start');
log_1.Log.info(`stress - create socket server`);
const wsServer = new WS.Server({ port: setting_1.Setting.instance.stressPort });
let userUpdateTimer;
process.on('uncaughtException', (err) => {
    log_1.Log.error(err);
});
process.on('message', (msg) => {
    log_1.Log.info(`stress - user message`);
    switch (msg.type) {
        case stress_type_1.StressMessageType.init:
            log_1.Log.info('stress - user init');
            initUser(Object.assign({}, msg));
            break;
        case stress_type_1.StressMessageType.start:
            log_1.Log.info('stress - user start');
            startStressProcess();
            break;
        case stress_type_1.StressMessageType.task:
            log_1.Log.info('stress - user task');
            tryTriggerStart(msg);
            break;
        case stress_type_1.StressMessageType.close:
            log_1.Log.info('stress - user close');
            Reflect.deleteProperty(users, msg.id);
            currentStressRequest = undefined;
            break;
        case stress_type_1.StressMessageType.stop:
            log_1.Log.info('stress - user stop');
            if (currentStressRequest.id !== msg.id) {
                log_1.Log.error(`stress - cannot stop a idle stress task, current: ${currentStressRequest.id}, target: ${msg.id}.`);
            }
            else {
                sendMsgToWorkers(msg);
            }
            break;
        default:
            break;
    }
});
function isGoNode() {
    return setting_1.Setting.instance.stressType === 'go';
}
function initUser(user) {
    users[user.id] = user;
    sendMsgToUser(stress_type_1.StressMessageType.init, user);
}
function getCurrentRequestTotalCount() {
    const { repeat, concurrencyCount, requestBodyList } = currentStressRequest.testCase;
    return repeat * requestBodyList.length * concurrencyCount;
}
function tryTriggerStart(request) {
    log_1.Log.info(`stress - tryTriggerStart`);
    if (_.keys(workers).length === 0) {
        log_1.Log.info('no worker, drop task');
        sendMsgToUser(stress_type_1.StressMessageType.noWorker, request, 'There is no valid Hitchhiker-Node, please run a Hitchhiker-Node first.');
        return;
    }
    if (_.values(workers).some(n => n.status !== stress_type_1.WorkerStatus.idle)) {
        log_1.Log.info('stress - trigger start: not all worker idle');
        if (request) {
            log_1.Log.info('stress - push to queue');
            stressQueue.push(request);
            broadcastMsgToUsers(stress_type_1.StressMessageType.status);
        }
        return;
    }
    request = request || stressQueue.shift();
    if (!request) {
        log_1.Log.info('stress - no request, return');
        return;
    }
    currentStressRequest = request;
    log_1.Log.info('stress - send msg to workers');
    sendMsgToWorkers({ type: stress_type_1.StressMessageType.fileStart, fileData: request.fileData });
}
function sendMsgToWorkers(request) {
    if (request.type === stress_type_1.StressMessageType.task) {
        const allocableRequests = getAllocableRequest(request);
        _.keys(allocableRequests).forEach(k => workers[k].socket.send(JSON.stringify(allocableRequests[k])));
    }
    else if (request.type === stress_type_1.StressMessageType.fileStart) {
        _.values(workers).forEach(w => {
            w.socket.send(JSON.stringify({ type: request.type }));
            if (request.fileData && request.fileData.length > 0) {
                w.socket.send(request.fileData);
            }
            w.socket.send(new Buffer([36, 36, 36]));
        });
    }
    else {
        _.values(workers).forEach(w => w.socket.send(JSON.stringify(request)));
    }
}
function getAllocableRequest(request) {
    const orderWorkers = _.orderBy(_.values(workers), 'cpuNum', 'desc');
    const totalCpuNum = _.sumBy(orderWorkers, 'cpuNum');
    const concurrencyPerCpu = request.testCase.concurrencyCount / totalCpuNum;
    const workerTaskCount = {};
    orderWorkers.forEach(w => {
        workerTaskCount[w.addr] = Math.floor(w.cpuNum * concurrencyPerCpu);
    });
    let leftConcurrencyCount = request.testCase.concurrencyCount - _.sum(_.values(workerTaskCount));
    orderWorkers.forEach(w => {
        if (workerTaskCount[w.addr] === 0 && leftConcurrencyCount > 0) {
            workerTaskCount[w.addr] = 1;
            leftConcurrencyCount--;
        }
    });
    orderWorkers.forEach(w => {
        if (leftConcurrencyCount > 0) {
            workerTaskCount[w.addr] = 1;
            leftConcurrencyCount--;
        }
    });
    const allocableRequestWorker = {};
    _.keys(workerTaskCount).forEach(k => {
        if (workerTaskCount[k] > 0) {
            log_1.Log.info(`allocate ${k} task num: ${workerTaskCount[k]}`);
            allocableRequestWorker[k] = Object.assign({}, request, { testCase: Object.assign({}, request.testCase, { concurrencyCount: workerTaskCount[k] }) });
        }
    });
    return allocableRequestWorker;
}
function sendMsgToUser(type, user, data) {
    if (!user) {
        log_1.Log.info(`stress - user invalid`);
        return;
    }
    log_1.Log.info(`stress ${type} - send msg to user ${user.id}`);
    const res = { type, workerInfos: _.values(workers).map(w => (Object.assign({}, w, { socket: undefined }))), data, tasks: stressQueue.map(s => s.stressName), currentTask: currentStressRequest ? currentStressRequest.stressName : '', currentStressId: currentStressRequest ? currentStressRequest.stressId : '' };
    log_1.Log.info(`stress ${type} - send msg to user ${user.id}`);
    process.send({ id: user.id, data: res });
}
function broadcastMsgToUsers(type, data) {
    log_1.Log.info(`stress ${type} - broadcast msg to user`);
    _.values(users).forEach(u => sendMsgToUser(type, u, data));
}
function startStressProcess() {
    wsServer.on('connection', (socket, req) => {
        const addr = req.connection.remoteAddress;
        workers[addr] = { addr: addr, socket, status: stress_type_1.WorkerStatus.idle, cpuNum: Number.NaN };
        log_1.Log.info(`stress - worker connected: ${addr}`);
        socket.on('message', data => {
            log_1.Log.info(`stress - data from ${addr}: ${JSON.stringify(data)}`);
            const obj = JSON.parse(data.toString());
            switch (obj.type) {
                case stress_type_1.StressMessageType.hardware:
                    workerInited(addr, obj.cpuNum, obj.status);
                    break;
                case stress_type_1.StressMessageType.status:
                    workerUpdated(addr, obj.status);
                    break;
                case stress_type_1.StressMessageType.runResult:
                    workerTrace(obj.runResult);
                    break;
                case stress_type_1.StressMessageType.start:
                    workerStarted(addr);
                    break;
                default:
                    break;
            }
        });
        socket.on('close', hadErr => {
            log_1.Log.info(`stress - closed: ${addr}`);
            Reflect.deleteProperty(workers, addr);
            broadcastMsgToUsers(stress_type_1.StressMessageType.status);
        });
        socket.on('error', err => {
            log_1.Log.info(`stress - error ${addr}: ${err}`);
        });
    });
}
function workerInited(addr, cpu, status) {
    log_1.Log.info(`stress - hardware`);
    workers[addr].cpuNum = cpu;
    workers[addr].status = status;
    broadcastMsgToUsers(stress_type_1.StressMessageType.status);
}
function workerStarted(addr) {
    workers[addr].status = stress_type_1.WorkerStatus.working;
    log_1.Log.info(`stress - worker ${addr} start`);
    broadcastMsgToUsers(stress_type_1.StressMessageType.status);
}
function workerUpdated(addr, status) {
    log_1.Log.info(`stress - status`);
    workers[addr].status = status;
    if (status === stress_type_1.WorkerStatus.ready) {
        if (_.values(workers).every(w => w.status === stress_type_1.WorkerStatus.ready)) {
            log_1.Log.info(`stress - all workers ready`);
            sendMsgToWorkers({ type: stress_type_1.StressMessageType.start });
            userUpdateTimer = setInterval(() => {
                sendMsgToUser(stress_type_1.StressMessageType.runResult, currentStressRequest, buildStressRunResult());
            }, setting_1.Setting.instance.stressUpdateInterval);
        }
    }
    else if (status === stress_type_1.WorkerStatus.fileReady) {
        log_1.Log.info(`stress - all workers file ready`);
        sendMsgToWorkers(currentStressRequest);
    }
    else if (status === stress_type_1.WorkerStatus.finish) {
        workers[addr].status = stress_type_1.WorkerStatus.idle;
        if (!_.values(workers).some(w => w.status !== stress_type_1.WorkerStatus.finish && w.status !== stress_type_1.WorkerStatus.idle)) {
            log_1.Log.info(`stress - all workers finish/idle`);
            const runResult = buildStressRunResult();
            storeStressRecord(runResult).then((v) => {
                clearInterval(userUpdateTimer);
                sendMsgToUser(stress_type_1.StressMessageType.finish, currentStressRequest, runResult);
                reset();
                tryTriggerStart();
                broadcastMsgToUsers(stress_type_1.StressMessageType.status);
            }).catch((reason) => log_1.Log.error(`store stress record failed: ${reason}`));
        }
    }
    else if (status === stress_type_1.WorkerStatus.working) {
        if (!startTime) {
            startTime = process.hrtime();
        }
    }
    else {
        log_1.Log.error('miss condition');
    }
    broadcastMsgToUsers(stress_type_1.StressMessageType.status);
}
function storeStressRecord(runResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const stress = yield stress_service_1.StressService.getById(currentStressRequest.stressId);
        stress.lastRunDate = new Date();
        yield stress_service_1.StressService.save(stress);
        log_1.Log.info('clear stress redundant records');
        yield stress_record_service_1.StressRecordService.clearRedundantRecords(currentStressRequest.stressId);
        log_1.Log.info('create new stress record');
        const stressRecord = new stress_record_1.StressRecord();
        stressRecord.stress = new stress_1.Stress();
        stressRecord.stress.id = currentStressRequest.stressId;
        stressRecord.result = runResult;
        const stressFailedInfo = new stress_failed_info_1.StressFailedInfo();
        stressFailedInfo.info = JSON.stringify(stressFailedResult);
        yield stress_record_service_1.StressRecordService.create(stressRecord, stressFailedInfo);
        log_1.Log.info('store stress record success');
    });
}
function workerTrace(runResult) {
    if (!currentStressRequest) {
        return;
    }
    if (!isGoNode()) {
        runResult.id += string_util_1.StringUtil.toString(runResult.param);
    }
    const id = runResult.id;
    stressReqDuration[id] = stressReqDuration[id] || { durations: [] };
    if (!runResult.duration) {
        log_1.Log.error(`worker trace miss duration: ${id}`);
    }
    stressReqDuration[id].durations.push(runResult.duration);
    const failedType = getFailedType(runResult);
    if (failedType) {
        stressFailedResult[failedType][id] = stressFailedResult[failedType][id] || [];
        stressFailedResult[failedType][id].push(runResult);
    }
}
function getFailedType(runResult) {
    if (runResult.status >= 500) {
        return stress_type_1.StressFailedType.m500;
    }
    else if (runResult.error && runResult.error.message) {
        return stress_type_1.StressFailedType.noRes;
    }
    else if (_.values(runResult.tests).some(v => !v)) {
        return stress_type_1.StressFailedType.testFailed;
    }
    return undefined;
}
function reset() {
    startTime = undefined;
    currentStressRequest = undefined;
    stressReqDuration = {};
    stressFailedResult = { m500: {}, testFailed: {}, noRes: {} };
    clearInterval(userUpdateTimer);
}
function buildStressRunResult() {
    const names = {};
    currentStressRequest.testCase.requestBodyList.forEach(r => names[r.id] = r.name);
    const totalCount = getCurrentRequestTotalCount();
    const doneCount = getDoneCount();
    const tps = doneCount / getPassedTime();
    const reqProgress = getRunProgress();
    buildDurationStatistics();
    return { names, totalCount, doneCount, tps, reqProgress, stressReqDuration, stressFailedResult: getFailedResultStatistics() };
}
function getDoneCount() {
    return _.keys(stressReqDuration).map(k => stressReqDuration[k].durations.length).reduce((p, c) => p + c, 0);
}
function getPassedTime() {
    return !startTime ? 0 : (process.hrtime(startTime)[0] * 1000 + _.toInteger(process.hrtime(startTime)[1] / 1000000)) / 1000;
}
function buildDurationStatistics() {
    _.values(stressReqDuration).forEach(d => {
        const reqElapse = _.sortBy(d.durations.map(t => (t.connect + t.dns + t.request) / goDurationRate));
        d.statistics = {
            averageConnect: d.durations.map(t => t.connect).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            averageDns: d.durations.map(t => t.dns).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            averageRequest: d.durations.map(t => t.request).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            high: reqElapse[reqElapse.length - 1],
            low: reqElapse[0],
            p50: reqElapse[Math.floor(reqElapse.length * 0.5)],
            p75: reqElapse[Math.floor(reqElapse.length * 0.75)],
            p90: reqElapse[Math.floor(reqElapse.length * 0.9)],
            p95: reqElapse[Math.floor(reqElapse.length * 0.95)],
            stddev: math_util_1.MathUtil.stddev(reqElapse)
        };
    });
}
function getFailedResultStatistics() {
    const statistics = { m500: {}, noRes: {}, testFailed: {} };
    const build = (type) => _.keys(stressFailedResult[type]).forEach(k => statistics[type][k] = stressFailedResult[type][k].length);
    build('m500');
    build('noRes');
    build('testFailed');
    return statistics;
}
function getRunProgress() {
    const requestList = currentStressRequest.testCase.requestBodyList;
    const reqProgresses = requestList.map(r => ({ id: r.id, num: 0 }));
    let lastFinishCount = currentStressRequest.testCase.repeat * currentStressRequest.testCase.concurrencyCount;
    let id;
    for (let i = 0; i < requestList.length; i++) {
        id = requestList[i].id;
        const currentReqCount = stressReqDuration[id] ? stressReqDuration[id].durations.length : 0;
        reqProgresses[i].num = lastFinishCount - currentReqCount;
        lastFinishCount = currentReqCount;
    }
    reqProgresses.push({ id: 'End', num: lastFinishCount });
    return reqProgresses;
}
//# sourceMappingURL=stress_process.js.map