"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_process_handler_1 = require("./base_process_handler");
const stress_type_1 = require("../../common/stress_type");
const log_1 = require("../../utils/log");
class StressNodejsWorkerHandler extends base_process_handler_1.BaseProcessHandler {
    handleMessage(msg) {
        log_1.Log.info(`stress nodejs worker handle msg`);
        if (msg === 'ready') {
            this.process.send({ type: stress_type_1.StressMessageType.start });
        }
        else if (msg === 'finish' || msg === 'error') {
            this.isFinish = true;
        }
        if (this.call) {
            this.call(msg);
        }
    }
    afterProcessCreated() {
        log_1.Log.info(`stress nodejs worker process created`);
    }
}
exports.StressNodejsWorkerHandler = StressNodejsWorkerHandler;
//# sourceMappingURL=stress_nodejs_worker_handler.js.map