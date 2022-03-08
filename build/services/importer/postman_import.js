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
const record_service_1 = require("../record_service");
const collection_service_1 = require("../collection_service");
const environment_service_1 = require("../environment_service");
const string_util_1 = require("../../utils/string_util");
const record_category_1 = require("../../common/record_category");
const metadata_type_1 = require("../../common/metadata_type");
const project_service_1 = require("../project_service");
const environment_1 = require("../../models/environment");
const variable_service_1 = require("../variable_service");
const data_mode_1 = require("../../common/data_mode");
class PostmanImport {
    import(data, projectId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = yield this.parsePostmanCollection(user, projectId, data);
            const environments = yield this.parsePostmanEnvV1(user, projectId, data);
            yield Promise.all(collections.map(c => collection_service_1.CollectionService.save(c)));
            yield Promise.all(_.flatten(collections.map(c => c.records)).map(r => record_service_1.RecordService.saveRecordHistory(record_service_1.RecordService.createRecordHistory(r, user))));
            yield Promise.all(environments.map(e => environment_service_1.EnvironmentService.save(e)));
        });
    }
    parsePostmanCollection(owner, projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data) {
                return [];
            }
            const type = this.getMetadataCategory(data);
            switch (type) {
                case metadata_type_1.MetadataType.PostmanCollectionV1:
                    return [yield this.parsePostmanCollectionV1(owner, projectId, data)];
                case metadata_type_1.MetadataType.PostmanAllV1:
                    return yield this.parsePostmanAllCollectionV1(owner, projectId, data);
                default:
                    throw new Error(`not support this type: ${type}`);
            }
        });
    }
    parsePostmanAllCollectionV1(owner, projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.collections) {
                return [];
            }
            return yield Promise.all(data.collections.map(c => this.parsePostmanCollectionV1(owner, projectId, c)));
        });
    }
    parsePostmanEnvV1(owner, projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.environments) {
                return [];
            }
            return data.environments.map(e => {
                const env = new environment_1.Environment();
                env.name = e.name;
                env.id = string_util_1.StringUtil.generateUID();
                env.variables = [];
                env.project = project_service_1.ProjectService.create(projectId);
                let sort = 0;
                if (e.values) {
                    e.values.forEach(v => {
                        const dtoVariable = v;
                        dtoVariable.isActive = v.enabled;
                        dtoVariable.sort = sort++;
                        const variable = variable_service_1.VariableService.fromDto(dtoVariable);
                        variable.id = string_util_1.StringUtil.generateUID();
                        variable.environment = env;
                        env.variables.push(variable);
                    });
                }
                return env;
            });
        });
    }
    parsePostmanCollectionV1(owner, projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let sort = yield record_service_1.RecordService.getMaxSort();
            const dtoCollection = Object.assign({}, data, { commonPreScript: '', commonSetting: { prescript: data.commonPreScript || '', test: '', headers: [] }, projectId: projectId, id: string_util_1.StringUtil.generateUID() });
            const collection = collection_service_1.CollectionService.fromDto(dtoCollection);
            collection.owner = owner;
            collection.project = project_service_1.ProjectService.create(projectId);
            if (data.folders) {
                data.folders.forEach(f => {
                    const dtoRecord = this.parseFolder(f, collection.id, ++sort);
                    collection.records.push(record_service_1.RecordService.fromDto(dtoRecord));
                });
            }
            if (data.requests) {
                data.requests.forEach(r => {
                    const dtoRecord = this.parseRequest(r, collection.id, data.folders, ++sort);
                    collection.records.push(record_service_1.RecordService.fromDto(dtoRecord));
                });
            }
            return collection;
        });
    }
    getMetadataCategory(data) {
        if (data.version && data.version === 1) {
            return metadata_type_1.MetadataType.PostmanAllV1;
        }
        else if (data.item) {
            return metadata_type_1.MetadataType.PostmanCollectionV2;
        }
        else {
            return metadata_type_1.MetadataType.PostmanCollectionV1;
        }
    }
    parseFolder(f, cid, sort) {
        const dtoRecord = f;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.dataMode = data_mode_1.DataMode.raw;
        dtoRecord.category = record_category_1.RecordCategory.folder;
        f.id = dtoRecord.id = string_util_1.StringUtil.generateUID();
        return dtoRecord;
    }
    parseRequest(r, cid, folders, sort) {
        const dtoRecord = r;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.headers = this.parseHeaders(r.headers);
        dtoRecord.body = this.parseBody(r);
        dtoRecord.formDatas = this.parseFormData(r.data);
        dtoRecord.test = r.tests;
        dtoRecord.dataMode = r.dataMode === 'urlencoded' ? data_mode_1.DataMode.urlencoded : data_mode_1.DataMode.raw;
        dtoRecord.category = record_category_1.RecordCategory.record;
        const folder = folders ? folders.find(f => f.order && !!f.order.find(o => o === dtoRecord.id)) : undefined;
        dtoRecord.pid = folder ? folder.id : '';
        dtoRecord.id = string_util_1.StringUtil.generateUID();
        dtoRecord.prescript = r.preRequestScript;
        return dtoRecord;
    }
    parseBody(data) {
        return _.isString(data.rawModeData || data.data) ? (data.rawModeData || data.data) : '';
    }
    parseFormData(data) {
        if (!_.isArray(data)) {
            return;
        }
        return data.map((d, i) => ({ id: string_util_1.StringUtil.generateUID(), key: d.key, value: d.value, isActive: d.enabled, description: d.description, sort: i }));
    }
    parseHeaders(headers) {
        let sort = 0;
        if (headers instanceof Array) {
            return headers.map((h, i) => (Object.assign({}, h, { id: string_util_1.StringUtil.generateUID(), sort: i })));
        }
        let rst = new Array();
        const headerArr = headers && typeof headers === 'string' ? headers.split('\n') : [];
        if (!headerArr) {
            return rst;
        }
        headerArr.forEach(header => {
            const keyValue = header.split(':');
            if (keyValue && keyValue.length > 1) {
                let key = keyValue[0].trim();
                let isActive = true;
                if (key.startsWith('//')) {
                    isActive = false;
                    key = key.substr(2);
                }
                rst.push({
                    key: key,
                    value: keyValue[1].trim(),
                    isActive: isActive,
                    isFav: false,
                    sort: sort++
                });
            }
        });
        return rst;
    }
}
exports.PostmanImport = PostmanImport;
//# sourceMappingURL=postman_import.js.map