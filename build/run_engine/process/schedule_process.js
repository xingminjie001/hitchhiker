"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const setting_1 = require("../../utils/setting");
const log_1 = require("../../utils/log");
const schedule_runner_1 = require("../schedule_runner");
const project_data_service_1 = require("../../services/project_data_service");
log_1.Log.init();
process.on('uncaughtException', (err) => {
    log_1.Log.error(err);
});
process.on('message', (msg) => {
    if (msg === 'start') {
        startScheduleProcess();
    }
    else if (msg === 'reload_project_data') {
        log_1.Log.info('schedule: reload libs');
        project_data_service_1.ProjectDataService.instance.reload();
    }
});
function startScheduleProcess() {
    new schedule_runner_1.ScheduleRunner().run();
    setInterval(() => {
        new schedule_runner_1.ScheduleRunner().run();
    }, setting_1.Setting.instance.scheduleDuration * 1000);
}
//# sourceMappingURL=schedule_process.js.map