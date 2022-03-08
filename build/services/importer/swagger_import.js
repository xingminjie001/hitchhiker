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
const _ = require("lodash");
const string_util_1 = require("../../utils/string_util");
const record_category_1 = require("../../common/record_category");
const record_service_1 = require("../record_service");
const parameter_type_1 = require("../../common/parameter_type");
const header_service_1 = require("../header_service");
const collection_service_1 = require("../collection_service");
const project_service_1 = require("../project_service");
const data_mode_1 = require("../../common/data_mode");
const environment_1 = require("../../models/environment");
const variable_service_1 = require("../variable_service");
const environment_service_1 = require("../environment_service");
class SwaggerImport {
    import(swaggerData, projectId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const env = this.createEnv(projectId, `${swaggerData.host}${swaggerData.basePath}`);
            this.baseUrl = '{{host}}';
            let sort = yield record_service_1.RecordService.getMaxSort();
            const dtoCollection = {
                name: swaggerData.info.title,
                commonPreScript: '',
                commonSetting: { prescript: '', test: '', headers: [] },
                projectId: projectId,
                id: string_util_1.StringUtil.generateUID(),
                description: swaggerData.info.description
            };
            const collection = collection_service_1.CollectionService.fromDto(dtoCollection);
            collection.owner = user;
            collection.project = project_service_1.ProjectService.create(projectId);
            collection.records = this.createRecords(swaggerData, collection.id, sort);
            yield collection_service_1.CollectionService.save(collection);
            yield Promise.all(collection.records.map(r => record_service_1.RecordService.saveRecordHistory(record_service_1.RecordService.createRecordHistory(r, user))));
            yield environment_service_1.EnvironmentService.save(env);
        });
    }
    createEnv(projectId, host) {
        const env = new environment_1.Environment();
        env.name = 'swagger env';
        env.id = string_util_1.StringUtil.generateUID();
        env.variables = [];
        env.project = project_service_1.ProjectService.create(projectId);
        const variable = variable_service_1.VariableService.fromDto({
            id: string_util_1.StringUtil.generateUID(),
            key: 'host',
            value: host,
            isActive: true,
            sort: 0
        });
        variable.environment = env;
        env.variables.push(variable);
        return env;
    }
    createRecords(swaggerData, collectionId, sort) {
        const folders = {};
        const records = [];
        _.keys(swaggerData.paths).forEach(path => {
            let pathName = path.substr(1);
            if (pathName.includes('/')) {
                pathName = pathName.substr(0, pathName.indexOf('/'));
            }
            if (!folders[pathName]) {
                folders[pathName] = this.createFolder(pathName, collectionId, ++sort);
                records.push(folders[pathName]);
            }
            const folderRecords = this.createRecordsForFolder(path, swaggerData.paths[path], swaggerData.schemes, folders[pathName].id, collectionId, sort);
            sort += folderRecords.length + 1;
            records.push(...folderRecords);
        });
        return records;
    }
    createFolder(name, collectionId, sort) {
        return record_service_1.RecordService.fromDto({
            id: string_util_1.StringUtil.generateUID(),
            name,
            collectionId,
            category: record_category_1.RecordCategory.folder,
            parameterType: parameter_type_1.ParameterType.ManyToMany,
            sort
        });
    }
    createRecordsForFolder(path, methodDatas, schemes, folderId, collectionId, sort) {
        return _.keys(methodDatas).map(method => {
            const methodData = methodDatas[method];
            const formData = this.parseFormData(methodData);
            return record_service_1.RecordService.fromDto({
                id: string_util_1.StringUtil.generateUID(),
                name: methodData.summary || methodData.operationId || '',
                collectionId,
                pid: folderId,
                category: record_category_1.RecordCategory.record,
                parameterType: parameter_type_1.ParameterType.ManyToMany,
                url: this.parseUrl(path, methodData, schemes),
                method: method.toUpperCase(),
                headers: this.parseHeaders(methodData),
                formDatas: formData,
                dataMode: formData.length > 0 ? data_mode_1.DataMode.urlencoded : data_mode_1.DataMode.raw,
                sort: ++sort
            });
        });
    }
    parseUrl(path, methodData, schemes) {
        path = path.replace('{', ':').replace('}', '');
        let url = `${(schemes || []).length > 0 ? schemes[0] : 'http'}://${this.baseUrl}${path}`;
        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'query').forEach(p => {
                url = `${url}${url.includes('?') ? '&' : '?'}${p.name}={{${p.name}}}`;
            });
        }
        return url;
    }
    parseFormData(methodData) {
        let formDatas = [];
        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'formData').forEach((p, i) => {
                formDatas.push({ id: undefined, key: p.name, value: `{{${p.name}}`, description: p.description, isActive: true, sort: i });
            });
        }
        return formDatas;
    }
    parseHeaders(methodData) {
        const headers = [];
        let sort = 0;
        if (methodData.consumes) {
            headers.push({ key: 'Content-Type', value: methodData.consumes[0], isActive: true, sort: ++sort });
        }
        if (methodData.produces) {
            headers.push({ key: 'Accept', value: methodData.produces.join(', '), isActive: true, sort: ++sort });
        }
        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'header').forEach((h, i) => {
                headers.push({ key: h.name, value: `{{${h.name}}}`, description: h.description, isActive: true, sort: i + sort + 1 });
            });
        }
        return headers.map(h => header_service_1.HeaderService.fromDto(h));
    }
}
exports.SwaggerImport = SwaggerImport;
//# sourceMappingURL=swagger_import.js.map