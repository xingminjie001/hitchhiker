"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const middleware_1 = require("./middlewares/middleware");
const log_1 = require("./utils/log");
const child_process_manager_1 = require("./run_engine/process/child_process_manager");
require("reflect-metadata");
const web_socket_service_1 = require("./services/web_socket_service");
const setting_1 = require("./utils/setting");
const project_data_service_1 = require("./services/project_data_service");
let app = new Koa();
log_1.Log.init();
process.on('uncaughtException', (err) => {
    log_1.Log.error(err);
});
setting_1.Setting.instance.init();
project_data_service_1.ProjectDataService.instance.init();
child_process_manager_1.ChildProcessManager.default.init();
app.use(middleware_1.default(app));
const server = app.listen(setting_1.Setting.instance.appPort);
server.timeout = 30 * 60 * 1000;
new web_socket_service_1.WebSocketService(server).start();
//# sourceMappingURL=index.js.map