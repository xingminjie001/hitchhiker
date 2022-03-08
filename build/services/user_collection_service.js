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
const record_service_1 = require("./record_service");
const collection_service_1 = require("./collection_service");
const user_service_1 = require("./user_service");
class UserCollectionService {
    static getUserCollections(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let collections = yield UserCollectionService.getUserProjectCollections(userId);
            const recordsList = yield record_service_1.RecordService.getByCollectionIds(collections.map(o => o.id), false, true);
            return { collections, recordsList };
        });
    }
    static getUserProjectCollections(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_service_1.UserService.getUserById(userId, true);
            if (!user) {
                return [];
            }
            const projectIds = user.projects.map(t => t.id);
            return yield collection_service_1.CollectionService.getByProjectIds(projectIds);
        });
    }
}
exports.UserCollectionService = UserCollectionService;
//# sourceMappingURL=user_collection_service.js.map