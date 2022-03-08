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
const environment_service_1 = require("../services/environment_service");
class EnvironmentController extends webapi_router_1.BaseController {
    create(ctx, env) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield environment_service_1.EnvironmentService.create(env);
        });
    }
    update(ctx, env) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield environment_service_1.EnvironmentService.update(env);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield environment_service_1.EnvironmentService.delete(id);
        });
    }
}
__decorate([
    webapi_router_1.POST('/environment'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EnvironmentController.prototype, "create", null);
__decorate([
    webapi_router_1.PUT('/environment'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EnvironmentController.prototype, "update", null);
__decorate([
    webapi_router_1.DELETE('/environment/:id'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnvironmentController.prototype, "delete", null);
exports.default = EnvironmentController;
//# sourceMappingURL=environment_controller.js.map