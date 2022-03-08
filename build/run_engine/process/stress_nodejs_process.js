"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setting_1 = require("../../utils/setting");
const WS = require("ws");
const OS = require("os");
const path = require("path");
const log_1 = require("../../utils/log");
const stress_type_1 = require("../../common/stress_type");
const child_process_manager_1 = require("./child_process_manager");
const math_util_1 = require("../../utils/math_util");
const stress_nodejs_worker_handler_1 = require("./stress_nodejs_worker_handler");
const restartDelay = 10 * 1000;
log_1.Log.init();
process.on('uncaughtException', (err) => {
    log_1.Log.error(err);
});
let ws;
let testCase;
let willReceiveFile = false;
const processManager = child_process_manager_1.ChildProcessManager.create('stress_nodejs_worker', { count: OS.cpus().length, entry: path.join(__dirname, './stress_nodejs_worker.js'), handlerCtor: stress_nodejs_worker_handler_1.StressNodejsWorkerHandler });
processManager.init();
runForHandlers((h, i) => h.call = handleChildProcessMsg);
function createWS() {
    return new WS(setting_1.Setting.instance.stressHost, { perMessageDeflate: false });
}
const connect = function () {
    ws = createWS();
    ws.on('open', function open() {
        log_1.Log.info('nodejs stress process - connect success');
        send(createMsg(stress_type_1.WorkerStatus.idle, stress_type_1.StressMessageType.hardware, null, OS.cpus().length));
    });
    ws.on('message', data => {
        if (willReceiveFile) {
            // save files
            if (data instanceof Buffer && data.length === 3 && data[0] === 36) {
                willReceiveFile = false;
                send(createMsg(stress_type_1.WorkerStatus.fileReady, stress_type_1.StressMessageType.status));
            }
        }
        else {
            const msg = JSON.parse(data.toString());
            log_1.Log.info(`nodejs stress process - receive case ${msg.type}`);
            handleMsg(msg);
        }
    });
    ws.on('close', (code, msg) => {
        log_1.Log.error(`nodejs stress process - close ${code}: ${msg}`);
        log_1.Log.info('will retry.');
        ws = null;
        setTimeout(connect, restartDelay);
    });
    ws.on('error', err => {
        log_1.Log.error(`nodejs stress process - error: ${err}`);
    });
};
connect();
function send(msg) {
    log_1.Log.info(`nodejs stress process - send message with type ${msg.type} and status: ${msg.status}`);
    ws.send(JSON.stringify(msg));
}
function handleMsg(msg) {
    switch (msg.type) {
        case stress_type_1.StressMessageType.task:
            testCase = msg.testCase;
            send(createMsg(stress_type_1.WorkerStatus.ready, stress_type_1.StressMessageType.status));
            log_1.Log.info('nodejs stress process - status: ready');
            break;
        case stress_type_1.StressMessageType.start:
            log_1.Log.info('nodejs stress process - status: start');
            send(createMsg(stress_type_1.WorkerStatus.working, stress_type_1.StressMessageType.status));
            run();
            break;
        case stress_type_1.StressMessageType.fileStart:
            log_1.Log.info('nodejs stress process - status: file start');
            willReceiveFile = true;
            break;
        case stress_type_1.StressMessageType.finish:
            log_1.Log.info('nodejs stress process - status: finish');
            finish();
            break;
        case stress_type_1.StressMessageType.stop:
            log_1.Log.info('nodejs stress process - status: stop');
            runForHandlers(h => h.process.send({ type: stress_type_1.StressMessageType.stop }));
            break;
        default:
            break;
    }
}
function handleChildProcessMsg(data) {
    if (data === 'ready') {
        log_1.Log.info('nodejs stress process - worker status: ready');
    }
    else if (data === 'finish' || data === 'error') {
        log_1.Log.info(`nodejs stress process - worker status: ${data}`);
        let isAllFinish = true;
        runForHandlers((h, i) => isAllFinish = isAllFinish && h.isFinish);
        if (isAllFinish) {
            finish();
        }
    }
    else {
        log_1.Log.info(`nodejs stress process - worker trace`);
        trace(JSON.parse(data));
    }
}
function runForHandlers(call) {
    const handler = processManager.getHandler('stress_nodejs_worker');
    if (handler instanceof Array) {
        handler.forEach(call);
    }
    else {
        call(handler, 0);
    }
}
function run() {
    const taskForProcessArr = math_util_1.MathUtil.distribute(testCase.concurrencyCount, OS.cpus().length);
    log_1.Log.info(`nodejs stress process - split task: ${JSON.stringify(taskForProcessArr)}`);
    runForHandlers((h, i) => {
        log_1.Log.info(`nodejs stress process - run process: ${h.process.pid}`);
        h.process.send({
            type: stress_type_1.StressMessageType.task,
            testCase: Object.assign({}, testCase, { concurrencyCount: taskForProcessArr[i] })
        });
    });
}
function finish() {
    send(createMsg(stress_type_1.WorkerStatus.finish, stress_type_1.StressMessageType.status));
    resetHandlerStatus();
}
function resetHandlerStatus() {
    log_1.Log.info(`nodejs stress process - reset handlers status`);
    runForHandlers((h, i) => h.isFinish = false);
}
function trace(rst) {
    send(createMsg(stress_type_1.WorkerStatus.working, stress_type_1.StressMessageType.runResult, rst));
}
function createMsg(status, type, runResult = null, cpuNum = 0) {
    return { status, type, runResult, cpuNum };
}
//# sourceMappingURL=stress_nodejs_process.js.map