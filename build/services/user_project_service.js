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
const user_service_1 = require("./user_service");
const message_1 = require("../common/message");
const project_service_1 = require("./project_service");
const environment_service_1 = require("./environment_service");
const _ = require("lodash");
const schedule_service_1 = require("./schedule_service");
const setting_1 = require("../utils/setting");
const stress_service_1 = require("./stress_service");
const user_collection_service_1 = require("./user_collection_service");
const record_service_1 = require("./record_service");
const collection_service_1 = require("./collection_service");
const project_data_service_1 = require("./project_data_service");
class UserProjectService {
    static quitProject(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield user_service_1.UserService.getUserById(info.userId, true);
            const projectIndex = user.projects.findIndex(v => v.id === info.projectId);
            if (projectIndex > -1) {
                user.projects.splice(projectIndex, 1);
            }
            yield user_service_1.UserService.save(user);
            return { success: true, message: message_1.Message.get('projectQuitSuccess') };
        });
    }
    static disbandProject(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield project_service_1.ProjectService.getProject(info.projectId, true, false, false, false);
            if (!project) {
                return { success: false, message: message_1.Message.get('projectNotExist') };
            }
            if (project.owner.id !== info.userId) {
                return { success: false, message: message_1.Message.get('projectDisbandNeedOwner') };
            }
            project.owner = undefined;
            yield project_service_1.ProjectService.save(project);
            yield project_service_1.ProjectService.delete(project.id);
            return { success: true, message: message_1.Message.get('projectDisbandSuccess') };
        });
    }
    static getUserInfo(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const { collections, recordsList } = yield user_collection_service_1.UserCollectionService.getUserCollections(user.id);
            let records = {};
            _.keys(recordsList).forEach(k => records[k] = _.chain(recordsList[k]).map(r => record_service_1.RecordService.toDto(r)).keyBy('id').value());
            const environments = _.groupBy(yield environment_service_1.EnvironmentService.getEnvironments(_.flatten(user.projects.map(t => t.environments.map(e => e.id)))), e => e.project.id);
            user.projects.forEach(t => t.environments = undefined);
            const projects = _.keyBy(user.projects, 'id');
            user.projects = undefined;
            const schedules = yield schedule_service_1.ScheduleService.getByUserId(user.id);
            const scheduleDict = _.keyBy(schedules.map(s => schedule_service_1.ScheduleService.toDto(s)), 'id');
            const stressDict = _.keyBy((yield stress_service_1.StressService.getByUserId(user.id)).map(s => stress_service_1.StressService.toDto(s)), 'id');
            const projectFiles = {
                globalJS: project_data_service_1.ProjectDataService.instance._gJsFiles,
                globalData: project_data_service_1.ProjectDataService.instance._gDataFiles,
                projectJS: _.pick(project_data_service_1.ProjectDataService.instance._pJsFiles, _.keys(projects)),
                projectData: _.pick(project_data_service_1.ProjectDataService.instance._pDataFiles, _.keys(projects))
            };
            return {
                collection: {
                    collections: _.keyBy(collections.map(c => collection_service_1.CollectionService.toDto(c)), 'id'),
                    records
                },
                user,
                projects,
                environments,
                schedules: scheduleDict,
                schedulePageSize: setting_1.Setting.instance.schedulePageSize,
                stresses: stressDict,
                projectFiles,
                defaultHeaders: setting_1.Setting.instance.defaultHeaders,
                syncInterval: setting_1.Setting.instance.syncInterval,
                sync: setting_1.Setting.instance.sync,
                enableUpload: setting_1.Setting.instance.enableUpload
            };
        });
    }
}
exports.UserProjectService = UserProjectService;
//# sourceMappingURL=user_project_service.js.map