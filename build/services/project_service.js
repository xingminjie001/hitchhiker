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
const project_1 = require("../models/project");
const connection_manager_1 = require("./connection_manager");
const message_1 = require("../common/message");
const string_util_1 = require("../utils/string_util");
const user_1 = require("../models/user");
const user_service_1 = require("./user_service");
const localhost_mapping_1 = require("../models/localhost_mapping");
const collection_service_1 = require("./collection_service");
const record_service_1 = require("./record_service");
const _ = require("lodash");
const environment_service_1 = require("./environment_service");
class ProjectService {
    static create(id) {
        const project = new project_1.Project();
        project.id = id;
        return project;
    }
    static fromDto(dtoProject, ownerId) {
        let project = ProjectService.create(dtoProject.id || string_util_1.StringUtil.generateUID());
        project.name = dtoProject.name;
        project.note = dtoProject.note;
        const owner = new user_1.User();
        owner.id = ownerId;
        project.owner = owner;
        return project;
    }
    static getProject(id, needOwner = true, needCollection = true, needUser = false, needEnv = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(project_1.Project).createQueryBuilder('project').leftJoinAndSelect('project.localhosts', 'localhost');
            if (needCollection) {
                rep = rep.leftJoinAndSelect('project.collections', 'collection');
            }
            if (needUser) {
                rep = rep.leftJoinAndSelect('project.members', 'members');
            }
            if (needOwner) {
                rep = rep.leftJoinAndSelect('project.owner', 'owner');
            }
            if (needEnv) {
                rep = rep.leftJoinAndSelect('project.environments', 'environments');
            }
            return yield rep.where('project.id=:id')
                .setParameter('id', id)
                .getOne();
        });
    }
    static getProjects(ids, needOwner = true, needCollection = true, needUser = false, needEnv = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0) {
                return [];
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(project_1.Project).createQueryBuilder('project').leftJoinAndSelect('project.localhosts', 'localhost');
            if (needCollection) {
                rep = rep.leftJoinAndSelect('project.collections', 'collection');
            }
            if (needUser) {
                rep = rep.leftJoinAndSelect('project.members', 'members');
            }
            if (needOwner) {
                rep = rep.leftJoinAndSelect('project.owner', 'owner');
            }
            if (needEnv) {
                rep = rep.leftJoinAndSelect(`project.environments`, 'environment');
            }
            return yield rep.where('1=1')
                .andWhereInIds(ids.map(id => ({ id })))
                .getMany();
        });
    }
    static createProject(dtoProject, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const project = ProjectService.fromDto(dtoProject, ownerId);
            const user = yield user_service_1.UserService.getUserById(ownerId, true);
            project.members.push(user);
            yield connection.getRepository(project_1.Project).save(project);
            return { success: true, message: message_1.Message.get('projectSaveSuccess') };
        });
    }
    static createOwnProject(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let project = ProjectService.create(string_util_1.StringUtil.generateUID());
            project.name = 'Me';
            project.owner = owner;
            project.isMe = true;
            project.members.push(owner);
            return yield connection.getRepository(project_1.Project).save(project);
        });
    }
    static updateProject(dtoProject) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(project_1.Project)
                .createQueryBuilder('project')
                .where('id=:id', { id: dtoProject.id })
                .update({ name: dtoProject.name, note: dtoProject.note })
                .execute();
            return { success: true, message: message_1.Message.get('projectSaveSuccess') };
        });
    }
    static save(project) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(project_1.Project).save(project);
            return { success: true, message: message_1.Message.get('projectSaveSuccess') };
        });
    }
    static delete(id, delCollection, delEnv) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const project = yield ProjectService.getProject(id, false, delCollection, false, delEnv);
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                if (delCollection) {
                    const records = yield record_service_1.RecordService.getByCollectionIds(project.collections.map(c => c.id));
                    yield Promise.all(_.flatten(_.values(records)).map(r => record_service_1.RecordService.delete(r.id)));
                    yield manager.remove(project.collections);
                }
                if (delEnv) {
                    yield Promise.all(project.environments.map(e => environment_service_1.EnvironmentService.delete(e.id)));
                }
                yield manager.remove(project.localhosts);
                yield manager.remove(project);
            }));
            return { success: true, message: message_1.Message.get('projectDeleteSuccess') };
        });
    }
    static createLocalhostMapping(id, userId, projectId, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapping = new localhost_mapping_1.LocalhostMapping();
            mapping.id = id || string_util_1.StringUtil.generateUID();
            mapping.ip = ip;
            mapping.userId = userId;
            mapping.project = ProjectService.create(projectId);
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(localhost_mapping_1.LocalhostMapping).save(mapping);
            return { success: true, message: message_1.Message.get('createLocalhostMappingSuccess') };
        });
    }
    static updateLocalhostMapping(id, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(localhost_mapping_1.LocalhostMapping)
                .createQueryBuilder('localhost')
                .where('id=:id', { id })
                .update({ ip })
                .execute();
            return { success: true, message: message_1.Message.get('updateLocalhostMappingSuccess') };
        });
    }
    static getLocalhost(userId, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let localhost = 'localhost';
            const collection = yield collection_service_1.CollectionService.getById(collectionId);
            if (collection) {
                const connection = yield connection_manager_1.ConnectionManager.getInstance();
                const mapping = yield connection.getRepository(localhost_mapping_1.LocalhostMapping)
                    .createQueryBuilder('localhost')
                    .where('userId=:userId', { userId })
                    .andWhere('projectId=:projectId', { projectId: collection.project.id })
                    .getOne();
                localhost = mapping ? mapping.ip || localhost : localhost;
            }
            return localhost;
        });
    }
    static updateGlobalFunc(id, globalFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(project_1.Project)
                .createQueryBuilder('project')
                .where('id=:id', { id })
                .update({ globalFunction })
                .execute();
            return { success: true, message: message_1.Message.get('updateGlobalFuncSuccess') };
        });
    }
    static getProjectByCollectionId(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield collection_service_1.CollectionService.getById(collectionId);
            if (collection) {
                return yield ProjectService.getProject(collection.project.id, false, false);
            }
            return undefined;
        });
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project_service.js.map