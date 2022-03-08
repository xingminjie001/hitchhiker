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
const schedule_service_1 = require("./schedule_service");
const schedule_runner_1 = require("../run_engine/schedule_runner");
const web_socket_handler_1 = require("./base/web_socket_handler");
const log_1 = require("../utils/log");
const message_1 = require("../common/message");
class ScheduleOnDemandService extends web_socket_handler_1.WebSocketHandler {
    onReceive(data) {
        log_1.Log.info(`receive data: ${data}`);
        if (!data) {
            this.close('invalid schedule id');
        }
        this.run(data).then(() => this.close());
    }
    onClose() {
        log_1.Log.info('client close');
        this.close();
    }
    run(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield schedule_service_1.ScheduleService.getById(id);
            if (!schedule) {
                this.close(message_1.Message.get('scheduleNotExist'));
                return;
            }
            yield new schedule_runner_1.ScheduleRunner().runSchedule(schedule, null, false, data => this.send(data));
        });
    }
}
exports.ScheduleOnDemandService = ScheduleOnDemandService;
//# sourceMappingURL=schedule_on_demand_service.js.map