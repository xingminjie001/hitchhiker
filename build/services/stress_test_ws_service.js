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
const web_socket_handler_1 = require("./base/web_socket_handler");
const log_1 = require("../utils/log");
const child_process_manager_1 = require("../run_engine/process/child_process_manager");
const string_util_1 = require("../utils/string_util");
const stress_type_1 = require("../common/stress_type");
const stress_service_1 = require("./stress_service");
class StressTestWSService extends web_socket_handler_1.WebSocketHandler {
    constructor() {
        super();
        this.handleMsg = (data) => {
            if (this.socket.readyState === this.socket.OPEN) {
                this.send(JSON.stringify(data));
            }
        };
        this.id = string_util_1.StringUtil.generateShortId();
    }
    get processHandler() {
        return child_process_manager_1.ChildProcessManager.default.getHandler('stress');
    }
    init() {
        this.processHandler.initStressUser(this.id, data => this.handleMsg(data));
    }
    onReceive(data) {
        log_1.Log.info(`Stress Test - receive data: ${data}`);
        let info;
        try {
            info = JSON.parse(data);
        }
        catch (e) {
            log_1.Log.error(e);
            return;
        }
        this.pass(info);
    }
    onClose() {
        log_1.Log.info('Stress Test - client close');
        this.processHandler.closeStressUser(this.id);
        this.close();
    }
    pass(info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!info) {
                this.close('Stress Test - invalid info');
                return;
            }
            if (info.type === stress_type_1.StressMessageType.task) {
                info.id = this.id;
                const data = yield stress_service_1.StressService.getStressInfo(info.stressId);
                if (!data.success) {
                    this.send(JSON.stringify({ type: stress_type_1.StressMessageType.error, data: data.message }));
                    return;
                }
                info.testCase = data.result.testCase;
                // info.fileData = await ScriptTransform.zipAll();
                info.stressName = data.result.name;
                this.processHandler.sendStressTask(info);
            }
            else if (info.type === stress_type_1.StressMessageType.stop) {
                this.processHandler.stopStressTask(this.id);
            }
        });
    }
}
exports.StressTestWSService = StressTestWSService;
//# sourceMappingURL=stress_test_ws_service.js.map