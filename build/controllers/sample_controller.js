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
class SampleController extends webapi_router_1.BaseController {
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                message: '',
                result: {
                    id,
                    name: 'sample'
                }
            };
        });
    }
    addSample(body) {
        return {
            success: true,
            message: 'add sample success.',
            result: body
        };
    }
    changeSample(body) {
        return {
            success: true,
            message: 'update sample success.',
            result: body
        };
    }
    delete(id) {
        return {
            success: true,
            message: `delete sample ${id} success`
        };
    }
    assert() {
        return {
            root: {
                array: [100, 102, 104],
                boolean: true,
                number: 10000,
                string: "hitchhiker",
                objArr: [
                    { name: "111" },
                    { name: "222" }
                ]
            }
        };
    }
}
__decorate([
    webapi_router_1.GET('/sample/:id'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SampleController.prototype, "getById", null);
__decorate([
    webapi_router_1.POST('/sample'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], SampleController.prototype, "addSample", null);
__decorate([
    webapi_router_1.PUT('/sample'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], SampleController.prototype, "changeSample", null);
__decorate([
    webapi_router_1.DELETE('/sample/:id'),
    __param(0, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], SampleController.prototype, "delete", null);
__decorate([
    webapi_router_1.GET('/sample/action/assert'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SampleController.prototype, "assert", null);
exports.default = SampleController;
//# sourceMappingURL=sample_controller.js.map