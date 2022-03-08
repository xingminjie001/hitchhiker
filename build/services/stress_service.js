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
const string_util_1 = require("../utils/string_util");
const connection_manager_1 = require("./connection_manager");
const message_1 = require("../common/message");
const user_collection_service_1 = require("./user_collection_service");
const stress_record_service_1 = require("./stress_record_service");
const stress_1 = require("../models/stress");
const stress_record_1 = require("../models/stress_record");
const record_service_1 = require("./record_service");
const _ = require("lodash");
const record_runner_1 = require("../run_engine/record_runner");
const project_service_1 = require("./project_service");
const environment_service_1 = require("./environment_service");
const script_transform_1 = require("../utils/script_transform");
const console_message_1 = require("./console_message");
class StressService {
    static fromDto(dtoStress) {
        const stress = new stress_1.Stress();
        stress.collectionId = dtoStress.collectionId;
        stress.environmentId = dtoStress.environmentId;
        stress.emails = dtoStress.emails;
        stress.id = dtoStress.id || string_util_1.StringUtil.generateUID();
        stress.name = dtoStress.name;
        stress.notification = dtoStress.notification;
        stress.concurrencyCount = dtoStress.concurrencyCount;
        stress.repeat = dtoStress.repeat;
        stress.qps = dtoStress.qps;
        stress.timeout = dtoStress.timeout;
        stress.keepAlive = dtoStress.keepAlive;
        stress.requests = dtoStress.requests;
        return stress;
    }
    static toDto(stress) {
        return Object.assign({}, stress, { stressRecords: stress.stressRecords ? stress.stressRecords.map(s => stress_record_service_1.StressRecordService.toDto(s)) : [], ownerId: stress.ownerId });
    }
    static save(stress) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(stress_1.Stress).save(stress);
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(stress_1.Stress)
                .createQueryBuilder('stress')
                .where('stress.id=:id', { id: id })
                .getOne();
        });
    }
    static getByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = yield user_collection_service_1.UserCollectionService.getUserProjectCollections(userId);
            if (!collections || collections.length === 0) {
                return [];
            }
            const collectionIds = collections.map(c => c.id);
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const parameters = {};
            const whereStrings = collectionIds.map((id, index) => {
                parameters[`id_${index}`] = id;
                return `collectionId=:id_${index}`;
            });
            const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];
            return yield connection.getRepository(stress_1.Stress)
                .createQueryBuilder('stress')
                .leftJoinAndSelect('stress.stressRecords', 'record')
                .where(whereStr, parameters)
                .getMany();
        });
    }
    static createNew(dtoStress, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const stress = StressService.fromDto(dtoStress);
            stress.ownerId = owner.id;
            yield StressService.save(stress);
            return { message: message_1.Message.get('stressCreateSuccess'), success: true };
        });
    }
    static update(dtoStress) {
        return __awaiter(this, void 0, void 0, function* () {
            const stress = StressService.fromDto(dtoStress);
            yield StressService.save(stress);
            return { message: message_1.Message.get('stressUpdateSuccess'), success: true };
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.createQueryBuilder(stress_record_1.StressRecord, 'stressRecord')
                    .where('stressId=:id', { id })
                    .delete()
                    .execute();
                yield manager.createQueryBuilder(stress_1.Stress, 'stress')
                    .where('id=:id', { id })
                    .delete()
                    .execute();
            }));
            yield connection.getRepository(stress_1.Stress)
                .createQueryBuilder('stress')
                .where('id=:id', { id })
                .delete()
                .execute();
            return { success: true, message: message_1.Message.get('stressDeleteSuccess') };
        });
    }
    static getStressInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const stress = yield StressService.getById(id);
            if (!stress) {
                return { success: false, message: message_1.Message.get('stressNotExist') };
            }
            const collectionRecords = yield record_service_1.RecordService.getByCollectionIds([stress.collectionId]);
            const records = _.keyBy((collectionRecords ? collectionRecords[stress.collectionId] : []).filter(r => stress.requests.some(i => i === r.id)), 'id');
            if (_.keys(records).length === 0) {
                return { success: false, message: message_1.Message.get('stressNoRecords') };
            }
            const envVariables = yield environment_service_1.EnvironmentService.getVariables(stress.environmentId);
            const { globalFunction } = (yield project_service_1.ProjectService.getProjectByCollectionId(stress.collectionId)) || { globalFunction: '' };
            const requestBodyList = new Array();
            stress.requests.forEach(i => {
                let record = records[i];
                const paramArr = string_util_1.StringUtil.parseParameters(record.parameters, record.parameterType, record.reduceAlgorithm);
                const headers = {};
                const url = string_util_1.StringUtil.stringifyUrl(record.url, record.queryStrings);
                if (paramArr.length === 0) {
                    record.headers.forEach(h => { if (h.isActive) {
                        headers[h.key] = h.value;
                    } });
                    requestBodyList.push(Object.assign({}, record, { url,
                        headers, prescript: StressService.mergeScript(globalFunction, record, true), test: StressService.mergeScript(globalFunction, record, false) }));
                }
                else {
                    for (let p of paramArr) {
                        let newRecord = record_runner_1.RecordRunner.applyReqParameterToRecord(record, p);
                        newRecord.headers.forEach(h => { if (h.isActive) {
                            headers[h.key] = h.value;
                        } });
                        const param = string_util_1.StringUtil.toString(p);
                        newRecord.id = `${record.id}${param}`;
                        newRecord.name = `${newRecord.name}\n${param}`;
                        requestBodyList.push(Object.assign({}, newRecord, { url,
                            param,
                            headers, prescript: StressService.mergeScript(globalFunction, record, true), test: StressService.mergeScript(globalFunction, record, false) }));
                    }
                }
            });
            return {
                success: true,
                message: '',
                result: {
                    testCase: {
                        envId: stress.environmentId,
                        records: yield record_service_1.RecordService.prepareRecordsForRun(_.values(records), stress.environmentId, console_message_1.ConsoleMessage.create(false), stress.requests.join(';')),
                        repeat: stress.repeat,
                        concurrencyCount: stress.concurrencyCount,
                        qps: stress.qps,
                        timeout: stress.timeout,
                        keepAlive: stress.keepAlive,
                        requestBodyList,
                        envVariables
                    },
                    name: stress.name
                }
            };
        });
    }
    static mergeScript(globalFunction, record, isPre) {
        return script_transform_1.ScriptTransform.toES5(isPre ? (`
                ${globalFunction || ''}
                ${record.collection.compatibleCommonPreScript()}
                ${record.prescript || ''}
            `) : (`
                ${globalFunction || ''}
                ${record.collection.commonTest()}
                ${record.test || ''}
            `));
    }
}
exports.StressService = StressService;
//# sourceMappingURL=stress_service.js.map