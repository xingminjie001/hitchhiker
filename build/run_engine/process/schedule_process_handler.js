"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_process_handler_1 = require("./base_process_handler");
class ScheduleProcessHandler extends base_process_handler_1.BaseProcessHandler {
    handleMessage(data) { }
    afterProcessCreated() {
        this.process.send('start');
    }
    reloadLib() {
        this.process.send('reload_project_data');
    }
}
exports.ScheduleProcessHandler = ScheduleProcessHandler;
//# sourceMappingURL=schedule_process_handler.js.map