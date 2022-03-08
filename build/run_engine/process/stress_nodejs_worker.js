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
const log_1 = require("../../utils/log");
const record_runner_1 = require("../record_runner");
const stress_type_1 = require("../../common/stress_type");
const _ = require("lodash");
const console_message_1 = require("../../services/console_message");
log_1.Log.init();
log_1.Log.info(`worker ${process.pid} start`);
let testCase;
let isFinish;
process.on('uncaughtException', (err) => {
    log_1.Log.error(err);
    process.send('error');
});
process.on('message', (msg) => {
    if (msg.type === stress_type_1.StressMessageType.start) {
        log_1.Log.info(`worker ${process.pid}: run`);
        isFinish = false;
        run();
    }
    else if (msg.type === stress_type_1.StressMessageType.task) {
        log_1.Log.info(`worker ${process.pid}: receive case`);
        testCase = msg.testCase;
        testCase.records.forEach(r => r.trace = d => process.send(d));
        process.send('ready');
    }
    else if (msg.type === stress_type_1.StressMessageType.stop) {
        log_1.Log.info(`worker ${process.pid}: stop`);
        isFinish = true;
    }
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (testCase.concurrencyCount >= 1) {
            yield Promise.all(_.times(testCase.concurrencyCount, runRecordRepeat));
        }
        log_1.Log.info(`worker ${process.pid}: finish`);
        process.send('finish');
        isFinish = true;
    });
}
function runRecordRepeat() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < testCase.repeat; i++) {
            if (isFinish) {
                break;
            }
            const cm = console_message_1.ConsoleMessage.create(false);
            yield record_runner_1.RecordRunner.runRecordExs(testCase.records, true, cm, () => isFinish);
        }
    });
}
//# sourceMappingURL=stress_nodejs_worker.js.map