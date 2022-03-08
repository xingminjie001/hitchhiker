"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_process_handler_1 = require("./base_process_handler");
const stress_type_1 = require("../../common/stress_type");
const log_1 = require("../../utils/log");
class StressProcessHandler extends base_process_handler_1.BaseProcessHandler {
    constructor() {
        super(...arguments);
        this.stressHandlers = {};
    }
    handleMessage(msg) {
        if (this.stressHandlers[msg.id]) {
            this.stressHandlers[msg.id](msg.data);
        }
    }
    afterProcessCreated() {
        this.process.send({ type: stress_type_1.StressMessageType.start });
    }
    initStressUser(id, dataHandler) {
        this.stressHandlers[id] = dataHandler;
        this.process.send({ type: stress_type_1.StressMessageType.init, id });
    }
    closeStressUser(id) {
        Reflect.deleteProperty(this.stressHandlers, id);
        this.process.send({ type: stress_type_1.StressMessageType.close, id });
    }
    sendStressTask(request) {
        log_1.Log.info('send stress test task.');
        this.process.send(request);
    }
    stopStressTask(id) {
        log_1.Log.info('stop stress test task.');
        this.process.send({ type: stress_type_1.StressMessageType.stop, id });
    }
}
exports.StressProcessHandler = StressProcessHandler;
//# sourceMappingURL=stress_process_handler.js.map