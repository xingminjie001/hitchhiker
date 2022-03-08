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
const collection_1 = require("../models/collection");
const connection_manager_1 = require("./connection_manager");
const user_1 = require("../models/user");
const message_1 = require("../common/message");
const string_util_1 = require("../utils/string_util");
const record_service_1 = require("./record_service");
const project_service_1 = require("./project_service");
const project_1 = require("../models/project");
class CollectionService {
    static save(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(collection_1.Collection).save(collection);
        });
    }
    static clone(collection) {
        const target = Object.create(collection);
        target.id = string_util_1.StringUtil.generateUID();
        target.records = target.records.map(r => record_service_1.RecordService.clone(r));
        target.createDate = new Date();
        return target;
    }
    static fromDto(dtoCollection) {
        const collection = new collection_1.Collection();
        collection.id = dtoCollection.id || string_util_1.StringUtil.generateUID();
        collection.name = dtoCollection.name;
        collection.commonPreScript = dtoCollection.commonPreScript;
        collection.reqStrictSSL = dtoCollection.reqStrictSSL;
        collection.reqFollowRedirect = dtoCollection.reqFollowRedirect;
        collection.description = dtoCollection.description;
        collection.commonSetting = dtoCollection.commonSetting;
        collection.project = new project_1.Project();
        collection.project.id = dtoCollection.projectId;
        collection.records = [];
        return collection;
    }
    static toDto(collection) {
        return Object.assign({}, collection, { projectId: collection.project.id });
    }
    static create(dtoCollection, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = new user_1.User();
            owner.id = userId;
            const collection = CollectionService.fromDto(dtoCollection);
            collection.owner = owner;
            yield CollectionService.save(collection);
            return { success: true, message: message_1.Message.get('collectionCreateSuccess') };
        });
    }
    static update(dtoCollection, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(collection_1.Collection)
                .update({ id: dtoCollection.id }, {
                name: dtoCollection.name,
                description: dtoCollection.description,
                commonPreScript: dtoCollection.commonPreScript,
                reqStrictSSL: !!dtoCollection.reqStrictSSL,
                reqFollowRedirect: !!dtoCollection.reqFollowRedirect,
                commonSetting: dtoCollection.commonSetting
            });
            return { success: true, message: message_1.Message.get('collectionUpdateSuccess') };
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .where('id=:id', { id })
                .update({ recycle: true })
                .execute();
            return { success: true, message: message_1.Message.get('collectionDeleteSuccess') };
        });
    }
    static getOwns(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .leftJoinAndSelect('collection.project', 'project')
                .leftJoinAndSelect('collection.owner', 'owner')
                .where('recycle = 0')
                .andWhere('owner.id = :userId')
                .orderBy('collection.name')
                .setParameter('userId', userId)
                .getMany();
        });
    }
    static getById(id, needRecords = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .leftJoinAndSelect('collection.project', 'project')
                .leftJoinAndSelect('collection.owner', 'owner');
            if (needRecords) {
                rep = rep.leftJoinAndSelect('collection.records', 'records');
            }
            return yield rep.where('recycle = 0')
                .andWhere('collection.id = :id')
                .setParameter('id', id)
                .getOne();
        });
    }
    static getByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0) {
                return [];
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .leftJoinAndSelect('collection.project', 'project')
                .leftJoinAndSelect('collection.owner', 'owner')
                .where('recycle = 0')
                .andWhereInIds(ids.map(id => ({ id })))
                .getMany();
        });
    }
    static getByProjectId(projectid) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .innerJoinAndSelect('collection.project', 'project', 'project.id=:id')
                .leftJoinAndSelect('collection.owner', 'owner')
                .where('recycle = 0')
                .setParameter('id', projectid)
                .getMany();
        });
    }
    static getByProjectIds(projectIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectIds || projectIds.length === 0) {
                return [];
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const parameters = {};
            const whereStrings = projectIds.map((id, index) => {
                parameters[`id_${index}`] = id;
                return `project.id=:id_${index}`;
            });
            const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];
            return yield connection.getRepository(collection_1.Collection)
                .createQueryBuilder('collection')
                .innerJoinAndSelect('collection.project', 'project')
                .leftJoinAndSelect('collection.owner', 'owner')
                .where('recycle = 0')
                .andWhere(whereStr, parameters)
                .orderBy('collection.name')
                .getMany();
        });
    }
    static shareCollection(collectionId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const origin = yield CollectionService.getById(collectionId, true);
            if (!origin) {
                return { success: false, message: message_1.Message.get('collectionNotExist') };
            }
            const target = CollectionService.clone(origin);
            target.project = project_service_1.ProjectService.create(projectId);
            yield CollectionService.save(origin);
        });
    }
}
exports.CollectionService = CollectionService;
//# sourceMappingURL=collection_service.js.map