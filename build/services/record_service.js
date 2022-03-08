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
const record_1 = require("../models/record");
const connection_manager_1 = require("./connection_manager");
const _ = require("lodash");
const message_1 = require("../common/message");
const header_1 = require("../models/header");
const record_category_1 = require("../common/record_category");
const collection_1 = require("../models/collection");
const header_service_1 = require("./header_service");
const string_util_1 = require("../utils/string_util");
const record_history_1 = require("../models/record_history");
const user_service_1 = require("./user_service");
const project_service_1 = require("./project_service");
const environment_service_1 = require("./environment_service");
const variable_service_1 = require("./variable_service");
const query_string_service_1 = require("./query_string_service");
const form_data_service_1 = require("./form_data_service");
const query_string_1 = require("../models/query_string");
const body_form_data_1 = require("../models/body_form_data");
class RecordService {
    static fromDto(target) {
        let collection = new collection_1.Collection();
        collection.id = target.collectionId;
        let record = new record_1.Record();
        record.id = target.id;
        record.url = target.url;
        record.pid = target.pid;
        record.body = target.body || '';
        record.headers = this.handleArray(target.headers, record.id, header_service_1.HeaderService.fromDto);
        record.test = target.test || '';
        record.sort = target.sort;
        record.method = target.method;
        record.collection = collection;
        record.name = target.name;
        record.description = target.description;
        record.category = target.category;
        record.bodyType = target.bodyType;
        record.dataMode = target.dataMode;
        record.parameters = target.parameters;
        record.reduceAlgorithm = target.reduceAlgorithm;
        record.parameterType = target.parameterType;
        record.prescript = target.prescript || '';
        record.assertInfos = target.assertInfos || {};
        record.queryStrings = this.handleArray(target.queryStrings, record.id, query_string_service_1.QueryStringService.fromDto);
        record.formDatas = this.handleArray(target.formDatas, record.id, form_data_service_1.FormDataService.fromDto);
        return record;
    }
    static handleArray(dtos, id, fromDto) {
        if (dtos instanceof Array) {
            return dtos.map(o => {
                let target = fromDto(o);
                return this.setRecordForChild(target, id);
            });
        }
    }
    static setRecordForChild(child, id) {
        child.record = new record_1.Record();
        child.record.id = id;
        return child;
    }
    static toDto(target) {
        return Object.assign({}, target, { collectionId: target.collection.id });
    }
    static formatHeaders(record) {
        let headers = {};
        record.headers.forEach(o => {
            if (o.isActive) {
                headers[o.key] = o.value;
            }
        });
        return headers;
    }
    static formatKeyValue(keyValues) {
        let objs = {};
        keyValues.forEach(o => {
            if (o.isActive) {
                objs[o.key] = o.value;
            }
        });
        return objs;
    }
    static restoreKeyValue(obj, fromDto) {
        const keyValues = [];
        _.keys(obj || {}).forEach(k => {
            keyValues.push(fromDto({
                isActive: true,
                key: k,
                value: obj[k],
                id: '',
                sort: 0
            }));
        });
        return keyValues;
    }
    static clone(record) {
        const target = Object.create(record);
        target.id = string_util_1.StringUtil.generateUID();
        target.headers = target.headers.map(h => header_service_1.HeaderService.clone(h));
        target.queryStrings = target.queryStrings.map(h => query_string_service_1.QueryStringService.clone(h));
        target.formDatas = target.formDatas.map(h => form_data_service_1.FormDataService.clone(h));
        target.createDate = new Date();
        return target;
    }
    static getByCollectionIds(collectionIds, excludeFolder, needHistory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionIds || collectionIds.length === 0) {
                return {};
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const parameters = {};
            const whereStrings = collectionIds.map((id, index) => {
                parameters[`id_${index}`] = id;
                return `collection.id=:id_${index}`;
            });
            const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];
            let rep = connection.getRepository(record_1.Record).createQueryBuilder('record')
                .innerJoinAndSelect('record.collection', 'collection')
                .leftJoinAndSelect('record.headers', 'header')
                .leftJoinAndSelect('record.queryStrings', 'queryString')
                .leftJoinAndSelect('record.formDatas', 'formData')
                .where(whereStr, parameters);
            if (needHistory) {
                rep = rep.leftJoinAndSelect('record.history', 'history');
            }
            if (excludeFolder) {
                rep = rep.andWhere('category=:category', { category: record_category_1.RecordCategory.record });
            }
            let records = yield rep.orderBy('record.name').getMany();
            if (needHistory) {
                const userDict = yield user_service_1.UserService.getNameByIds(_.chain(records.map(r => r.history.map(h => h.userId))).flatten().filter(r => !!r).uniq().value());
                records.forEach(r => r.history.forEach(h => h.user = userDict[h.userId]));
            }
            let recordsList = _.groupBy(records, o => o.collection.id);
            return recordsList;
        });
    }
    static getById(id, includeHeaders = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(record_1.Record).createQueryBuilder('record');
            if (includeHeaders) {
                rep = rep.leftJoinAndSelect('record.headers', 'header')
                    .leftJoinAndSelect('record.queryStrings', 'queryString')
                    .leftJoinAndSelect('record.formDatas', 'formData');
            }
            return yield rep.where('record.id=:id', { id: id }).getOne();
        });
    }
    static getChildren(id, includeHeaders = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(record_1.Record).createQueryBuilder('record');
            if (includeHeaders) {
                rep = rep.leftJoinAndSelect('record.headers', 'header')
                    .leftJoinAndSelect('record.queryStrings', 'queryString')
                    .leftJoinAndSelect('record.formDatas', 'formData');
            }
            return yield rep.where('record.pid=:pid', { pid: id }).getMany();
        });
    }
    static create(record, user) {
        return __awaiter(this, void 0, void 0, function* () {
            record.sort = yield this.getMaxSort();
            this.adjustAttachs(record.headers);
            this.adjustAttachs(record.formDatas);
            this.adjustAttachs(record.queryStrings);
            return yield this.save(record, user);
        });
    }
    static update(record, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const recordInDB = yield this.getById(record.id, true);
            if (recordInDB) {
                if ((recordInDB.headers || []).length > 0) {
                    yield connection.getRepository(header_1.Header).remove(recordInDB.headers);
                }
                if ((recordInDB.queryStrings || []).length > 0) {
                    yield connection.getRepository(query_string_1.QueryString).remove(recordInDB.queryStrings);
                }
                if ((recordInDB.formDatas || []).length > 0) {
                    yield connection.getRepository(body_form_data_1.BodyFormData).remove(recordInDB.formDatas);
                }
            }
            this.adjustAttachs(record.headers);
            this.adjustAttachs(record.formDatas);
            this.adjustAttachs(record.queryStrings);
            return yield this.save(record, user);
        });
    }
    static deleteFolder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield RecordService.getChildren(id);
            children.forEach((r) => __awaiter(this, void 0, void 0, function* () { return yield RecordService.deleteRecord(r.id); }));
            return yield RecordService.deleteRecord(id);
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield RecordService.getById(id);
            if (record.category === record_category_1.RecordCategory.record) {
                return yield RecordService.deleteRecord(id);
            }
            else {
                return yield RecordService.deleteFolder(record.id);
            }
        });
    }
    static deleteRecord(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                header_service_1.HeaderService.deleteForRecord(id),
                query_string_service_1.QueryStringService.deleteForRecord(id),
                form_data_service_1.FormDataService.deleteForRecord(id)
            ]);
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield RecordService.clearHistories(manager, id);
                yield manager.createQueryBuilder(record_1.Record, 'record')
                    .delete()
                    .where('record.id=:id', { id: id })
                    .execute();
            }));
            return { success: true, message: message_1.Message.get('recordDeleteSuccess') };
        });
    }
    static adjustAttachs(attachs) {
        if (!attachs) {
            return;
        }
        attachs.forEach((attach, index) => {
            attach.id = attach.id || string_util_1.StringUtil.generateUID();
            attach.sort = index;
        });
    }
    static getMaxSort() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const data = yield connection.getRepository(record_1.Record)
                .query('select sort from record order by sort desc limit 1');
            let maxSort = ++RecordService._sort;
            if (data && data[0] && data[0].sort) {
                maxSort = Math.max(maxSort, data[0].sort + 1);
                RecordService._sort = maxSort;
            }
            return maxSort;
        });
    }
    static sort(recordId, folderId, collectionId, newSort) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.query('update record r set r.sort = r.sort+1 where r.sort >= ? and r.collectionId = ? and pid = ?', [newSort, collectionId, folderId]);
                yield manager.createQueryBuilder(record_1.Record, 'record')
                    .where('record.id=:id', { 'id': recordId })
                    .update(record_1.Record, { 'collectionId': collectionId, 'pid': folderId, 'sort': newSort })
                    .execute();
            }));
            return { success: true, message: message_1.Message.get('recordSortSuccess') };
        });
    }
    static save(record, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!record.name) {
                return { success: false, message: message_1.Message.get('recordCreateFailedOnName') };
            }
            if (!record.id) {
                record.id = string_util_1.StringUtil.generateUID();
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.save(record);
                if (record.category === record_category_1.RecordCategory.record) {
                    yield manager.save(RecordService.createRecordHistory(record, user));
                }
            }));
            return { success: true, message: message_1.Message.get('recordSaveSuccess') };
        });
    }
    static toTree(records, parent, pushedRecord) {
        let result = new Array();
        let nonParentRecord = new Array();
        pushedRecord = pushedRecord || new Array();
        const pushChild = (r, p) => {
            p.children = p.children || [];
            p.children.push(r);
        };
        records.forEach(r => {
            if (r.category === record_category_1.RecordCategory.folder) {
                if (!r.pid && !parent) {
                    result.push(r);
                    pushedRecord.push(r.id);
                    RecordService.toTree(records, r, pushedRecord);
                }
                else if (parent && r.pid === parent.id) {
                    pushChild(r, parent);
                    pushedRecord.push(r.id);
                    RecordService.toTree(records, r, pushedRecord);
                }
            }
            else if (parent && r.pid === parent.id) {
                pushChild(r, parent);
            }
            else if (!parent && !r.pid) {
                nonParentRecord.push(r);
            }
        });
        result.push(...nonParentRecord);
        return result;
    }
    static saveRecordHistory(history) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.manager.save(history);
        });
    }
    static createRecordHistory(record, user) {
        const history = new record_history_1.RecordHistory();
        history.target = record;
        history.user = user;
        history.record = Object.assign({}, record);
        Reflect.deleteProperty(history.record, 'collection');
        Reflect.deleteProperty(history.record, 'doc');
        Reflect.deleteProperty(history.record, 'history');
        Reflect.deleteProperty(history.record, 'children');
        history.record.headers = this.deleteRecordForCascade(record.headers || []);
        history.record.queryStrings = this.deleteRecordForCascade(record.queryStrings || []);
        history.record.formDatas = this.deleteRecordForCascade(record.formDatas || []);
        return history;
    }
    static deleteRecordForCascade(cascades) {
        return (cascades || []).map(c => {
            const cascade = Object.assign({}, c);
            Reflect.deleteProperty(cascade, 'record');
            return cascade;
        });
    }
    static clearHistories(manager, rid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield manager.createQueryBuilder(record_history_1.RecordHistory, 'recordHistory')
                .where('targetId=:rid', { rid })
                .delete()
                .execute();
        });
    }
    static findAllParentFolders(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const parents = new Array();
            const findParent = (id) => __awaiter(this, void 0, void 0, function* () {
                const p = yield this.getById(id, true);
                if (p) {
                    parents.splice(0, 0, p);
                    if (p.pid) {
                        findParent(p.pid);
                    }
                }
            });
            yield findParent(record.pid);
            return parents;
        });
    }
    static combineScriptAndHeaders(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const { globalFunction } = (yield project_service_1.ProjectService.getProjectByCollectionId(record.collection.id)) || { globalFunction: '' };
            const parents = yield this.findAllParentFolders(record);
            const prescript = `
            ${globalFunction || ''};
            ${record.collection ? record.collection.compatibleCommonPreScript() : ''};
            ${parents.map(p => p.prescript || '').join(';\n')};
            ${record.prescript || ''};
        `;
            const test = `
            ${globalFunction || ''};
            ${record.collection.commonTest()};
            ${parents.map(p => p.test || '').join(';\n')};
            ${record.test || ''};
        `;
            const parentHeaders = new Array();
            parents.forEach(p => parentHeaders.push(...p.headers));
            return Object.assign({}, record, { headers: [...record.collection.commonHeaders().map(h => header_service_1.HeaderService.fromDto(h)), ...parentHeaders, ...record.headers], prescript,
                test });
        });
    }
    static prepareRecordsForRun(records, envId, cm, orderIds, trace) {
        return __awaiter(this, void 0, void 0, function* () {
            const vid = string_util_1.StringUtil.generateUID();
            const env = yield environment_service_1.EnvironmentService.get(envId, true);
            const envName = env ? env.name : '';
            cm.push(`Get environment info for ${envName || 'No Environment'}`);
            const envVariables = {};
            ((env ? env.variables : []) || []).filter(v => v.isActive).forEach(v => envVariables[v.key] = v.value);
            let recordExs = [];
            for (let r of records) {
                cm.push('Combine scripts');
                let newRecord = Object.assign({}, (yield RecordService.combineScriptAndHeaders(r)));
                cm.push('Get project info');
                const { id: pid } = (yield project_service_1.ProjectService.getProjectByCollectionId(r.collection.id)) || { id: '' };
                cm.push('Apply environment variables');
                newRecord = yield variable_service_1.VariableService.applyVariableForRecord(envId, newRecord);
                recordExs.push(Object.assign({}, newRecord, { pid, envId, envName, envVariables, vid, param: '', trace }));
            }
            recordExs = _.sortBy(recordExs, 'name');
            const recordDict = _.keyBy(recordExs, 'id');
            cm.push('Sort records');
            const orderRecords = (orderIds || '').split(';').map(i => i.includes(':') ? i.substr(0, i.length - 2) : i).filter(r => recordDict[r]).map(r => recordDict[r]);
            return _.unionBy(orderRecords, recordExs, 'id');
        });
    }
    static generateRequestInfo(record) {
        return `                method: ${record.method}
                url: ${record.url}
                headers: ${record.headers.map(h => `${h.key || ''}:${h.value || ''}`).join('\n                         ')}
                
                body: ${record.body || ''}
                form: ${(record.formDatas || []).map(f => `${f.key || ''}:${f.value || ''}`).join('\n                      ')}`;
    }
}
RecordService._sort = 0;
exports.RecordService = RecordService;
//# sourceMappingURL=record_service.js.map