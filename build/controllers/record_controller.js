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
const record_service_1 = require("../services/record_service");
const record_runner_1 = require("../run_engine/record_runner");
const session_service_1 = require("../services/session_service");
class RecordController extends webapi_router_1.BaseController {
    create(ctx, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = session_service_1.SessionService.getUser(ctx);
            return yield record_service_1.RecordService.create(record_service_1.RecordService.fromDto(record), user);
        });
    }
    update(ctx, record) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = session_service_1.SessionService.getUser(ctx);
            return yield record_service_1.RecordService.update(record_service_1.RecordService.fromDto(record), user);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield record_service_1.RecordService.delete(id);
        });
    }
    run(ctx, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = record_service_1.RecordService.fromDto(data.record);
            const userId = session_service_1.SessionService.getUserId(ctx);
            return yield record_runner_1.RecordRunner.runRecordFromClient(record, data.environment, userId, ctx.res);
        });
    }
    sort(info) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield record_service_1.RecordService.sort(info.recordId, info.folderId, info.collectionId, info.newSort);
        });
    }
}
__decorate([
    webapi_router_1.POST('/record'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "create", null);
__decorate([
    webapi_router_1.PUT('/record'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "update", null);
__decorate([
    webapi_router_1.DELETE('/record/:id'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "delete", null);
__decorate([
    webapi_router_1.POST('/record/run'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "run", null);
__decorate([
    webapi_router_1.POST('/record/sort'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordController.prototype, "sort", null);
exports.default = RecordController;
//# sourceMappingURL=record_controller.js.map