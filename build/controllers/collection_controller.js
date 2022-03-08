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
const collection_service_1 = require("../services/collection_service");
const user_collection_service_1 = require("../services/user_collection_service");
const webapi_router_1 = require("webapi-router");
const Koa = require("koa");
const session_service_1 = require("../services/session_service");
const message_1 = require("../common/message");
const _ = require("lodash");
const record_service_1 = require("../services/record_service");
const request_import_1 = require("../services/base/request_import");
class CollectionController extends webapi_router_1.BaseController {
    getCollections(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session_service_1.SessionService.getUserId(ctx);
            const { collections, recordsList } = yield user_collection_service_1.UserCollectionService.getUserCollections(userId);
            let records = {};
            _.keys(recordsList).forEach(k => records[k] = _.chain(recordsList[k]).map(r => record_service_1.RecordService.toDto(r)).keyBy('id').value());
            return {
                success: true,
                message: 'fetch collections success',
                result: {
                    collections: _.keyBy(collections.map(c => collection_service_1.CollectionService.toDto(c)), 'id'),
                    records
                }
            };
        });
    }
    create(ctx, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session_service_1.SessionService.getUserId(ctx);
            return yield collection_service_1.CollectionService.create(collection, userId);
        });
    }
    update(ctx, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield collection_service_1.CollectionService.update(collection, session_service_1.SessionService.getUserId(ctx));
        });
    }
    delete(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield collection_service_1.CollectionService.delete(id);
        });
    }
    share(ctx, collectionId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield collection_service_1.CollectionService.shareCollection(collectionId, projectId);
        });
    }
    importFromPostman(ctx, projectId, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = session_service_1.SessionService.getUser(ctx);
            yield request_import_1.Importer.do(info, projectId, user);
            return { success: true, message: message_1.Message.get('importPostmanSuccess') };
        });
    }
}
__decorate([
    webapi_router_1.GET('/collections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "getCollections", null);
__decorate([
    webapi_router_1.POST('/collection'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "create", null);
__decorate([
    webapi_router_1.PUT('/collection'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "update", null);
__decorate([
    webapi_router_1.DELETE('/collection/:id'),
    __param(1, webapi_router_1.PathParam('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "delete", null);
__decorate([
    webapi_router_1.GET('/collection/share/:collectionid/to/:projectid'),
    __param(1, webapi_router_1.PathParam('collectionid')), __param(2, webapi_router_1.PathParam('projectid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "share", null);
__decorate([
    webapi_router_1.POST('/collection/:projectid'),
    __param(1, webapi_router_1.PathParam('projectid')), __param(2, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CollectionController.prototype, "importFromPostman", null);
exports.default = CollectionController;
//# sourceMappingURL=collection_controller.js.map