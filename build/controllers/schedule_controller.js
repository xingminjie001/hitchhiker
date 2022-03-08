"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const webapi_router_1 = require("webapi-router");
const Koa = require("koa");
const schedule_service_1 = require("../services/schedule_service");
const schedule_record_service_1 = require("../services/schedule_record_service");
const message_1 = require("../common/message");
const schedule_runner_1 = require("../run_engine/schedule_runner");
class ScheduleController extends webapi_router_1.BaseController {
    createNew(ctx, schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            return schedule_service_1.ScheduleService.createNew(schedule, ctx.session.user);
        });
    }
    update(schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            return schedule_service_1.ScheduleService.update(schedule);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return schedule_service_1.ScheduleService.delete(id);
        });
    }
    getSchedules(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield schedule_service_1.ScheduleService.getByUserId(ctx.session.userId);
            return { success: true, message: '', result: schedules };
        });
    }
    getSchedulesInPage(ctx, id, pageNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const [schedules] = yield schedule_record_service_1.ScheduleRecordService.get(id, pageNum);
            return { success: true, message: '', result: schedules };
        });
    }
    run(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield schedule_service_1.ScheduleService.getById(id);
            if (!schedule) {
                return { success: false, message: message_1.Message.get('scheduleNotExist') };
            }
            new schedule_runner_1.ScheduleRunner().runSchedule(schedule, null, false);
            return { success: true, message: '' };
        });
    }
}
__decorate([
    webapi_router_1.POST('/schedule'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "createNew", null);
__decorate([
    webapi_router_1.PUT('/schedule'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "update", null);
__decorate([
    webapi_router_1.DELETE('/schedule/:id'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "delete", null);
__decorate([
    webapi_router_1.GET('/schedules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSchedules", null);
__decorate([
    webapi_router_1.GET('/schedule/:id/records'),
    __param(1, webapi_router_1.PathParam('id')), __param(2, webapi_router_1.QueryParam('pagenum')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getSchedulesInPage", null);
__decorate([
    webapi_router_1.GET('/schedule/:id/run'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "run", null);
exports.default = ScheduleController;
//# sourceMappingURL=schedule_controller.js.map