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
require("reflect-metadata");
const schedule_service_1 = require("../services/schedule_service");
const record_service_1 = require("../services/record_service");
const record_runner_1 = require("./record_runner");
const _ = require("lodash");
const schedule_record_1 = require("../models/schedule_record");
const schedule_record_service_1 = require("../services/schedule_record_service");
const connection_manager_1 = require("../services/connection_manager");
const environment_service_1 = require("../services/environment_service");
const notification_mode_1 = require("../interfaces/notification_mode");
const user_service_1 = require("../services/user_service");
const collection_service_1 = require("../services/collection_service");
const project_service_1 = require("../services/project_service");
const mail_service_1 = require("../services/mail_service");
const log_1 = require("../utils/log");
const date_util_1 = require("../utils/date_util");
const record_category_1 = require("../common/record_category");
const sandbox_1 = require("./sandbox");
const setting_1 = require("../utils/setting");
const validate_util_1 = require("../utils/validate_util");
const backup_service_1 = require("../services/backup_service");
class ScheduleRunner {
    constructor() {
        this.getRecordDisplayName = (recordDict, id) => {
            const unknownRecord = 'unknown';
            const record = recordDict[id];
            if (!record) {
                return unknownRecord;
            }
            const folder = record.pid ? recordDict[record.pid] : undefined;
            return folder ? `${folder.name}/${record.name}` : record.name;
        };
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.Log.info('schedule start.');
            log_1.Log.info('get all schedule.');
            yield connection_manager_1.ConnectionManager.init();
            const schedules = yield this.getAllSchedules();
            if (schedules.length === 0) {
                log_1.Log.info('schedules length is 0.');
                return;
            }
            log_1.Log.info('get records by collection ids.');
            const recordDict = yield record_service_1.RecordService.getByCollectionIds(_.sortedUniq(schedules.map(s => s.collectionId)));
            yield Promise.all(schedules.map(schedule => this.runSchedule(schedule, recordDict[schedule.collectionId], true)));
            log_1.Log.info('backup db start.');
            yield backup_service_1.BackupService.backupDB();
        });
    }
    runSchedule(schedule, records, isScheduleRun, trace) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!records) {
                const collectionRecords = yield record_service_1.RecordService.getByCollectionIds([schedule.collectionId]);
                records = collectionRecords[schedule.collectionId];
            }
            if (!records || records.length === 0) {
                log_1.Log.info(`record count is 0`);
                if (trace) {
                    trace(JSON.stringify({ isResult: true }));
                }
                return;
            }
            log_1.Log.info(`run schedule ${schedule.name}`);
            schedule.lastRunDate = date_util_1.DateUtil.getUTCDate();
            yield schedule_service_1.ScheduleService.save(schedule);
            const recordsWithoutFolder = records.filter(r => r.category === record_category_1.RecordCategory.record);
            const needCompare = schedule.needCompare && schedule.compareEnvironmentId;
            const originRunResults = yield record_runner_1.RecordRunner.runRecords(recordsWithoutFolder, schedule.environmentId, schedule.needOrder, schedule.recordsOrder, true, trace);
            const compareRunResults = needCompare ? yield record_runner_1.RecordRunner.runRecords(recordsWithoutFolder, schedule.compareEnvironmentId, schedule.needOrder, schedule.recordsOrder, true, trace) : [];
            const record = yield this.storeRunResult(originRunResults, compareRunResults, schedule, isScheduleRun);
            if (trace) {
                trace(JSON.stringify(Object.assign({ isResult: true }, record, { runDate: new Date(record.runDate + ' UTC') })));
            }
            if (schedule.mailMode !== notification_mode_1.MailMode.mailWhenFail || !record.success) {
                log_1.Log.info('send mails');
                const mails = yield this.getMailsByMode(schedule);
                if (!mails || mails.length === 0) {
                    log_1.Log.info('no valid email');
                    return;
                }
                const mailRecords = yield this.getRecordInfoForMail(record, records, schedule.environmentId, schedule.compareEnvironmentId);
                if (!record.schedule.mailIncludeSuccessReq) {
                    mailRecords.runResults = mailRecords.runResults.filter(r => !r.isSuccess);
                }
                yield mail_service_1.MailService.scheduleMail(mails, mailRecords);
            }
            log_1.Log.info(`run schedule finish`);
        });
    }
    getMailsByMode(schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            if (schedule.notification === notification_mode_1.NotificationMode.me) {
                const user = yield user_service_1.UserService.getUserById(schedule.ownerId);
                return user ? [user.email] : [];
            }
            else if (schedule.notification === notification_mode_1.NotificationMode.project) {
                const collection = yield collection_service_1.CollectionService.getById(schedule.collectionId);
                if (!collection) {
                    return [];
                }
                const project = yield project_service_1.ProjectService.getProject(collection.project.id, false, false, true, false);
                if (!project) {
                    return [];
                }
                return project.members.map(m => m.email);
            }
            else if (schedule.notification === notification_mode_1.NotificationMode.custom) {
                return schedule.emails.split(';');
            }
            return [];
        });
    }
    getRecordInfoForMail(record, records, originEnvId, compareEnvId) {
        return __awaiter(this, void 0, void 0, function* () {
            const envNames = _.keyBy(yield environment_service_1.EnvironmentService.getEnvironments([originEnvId, compareEnvId]), 'id');
            const recordDict = _.keyBy(records, 'id');
            return Object.assign({}, record, { scheduleName: record.schedule.name, runResults: [...this.getRunResultForMail(record.result.origin, originEnvId, envNames, recordDict),
                    ...this.getRunResultForMail(record.result.compare, compareEnvId, envNames, recordDict)] });
        });
    }
    getRunResultForMail(runResults, envId, envNames, recordDict) {
        const unknownEnv = 'No Environment';
        const getMailInfo = (r) => (Object.assign({}, r, { isSuccess: this.isSuccess(r), envName: envNames[envId] ? envNames[envId].name : unknownEnv, recordName: this.getRecordDisplayName(recordDict, r.id), duration: r.elapsed, parameter: r.param }));
        return _.flatten(runResults.map(r => this.isRunResult(r) ? getMailInfo(r) : _.values(r).map(rst => getMailInfo(rst))));
    }
    isRunResult(res) {
        return res.id !== undefined;
    }
    storeRunResult(originRunResults, compareRunResults, schedule, isScheduleRun) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduleRecord = new schedule_record_1.ScheduleRecord();
            const totalRunResults = _.flatten([...originRunResults, ...compareRunResults].map(r => this.isRunResult(r) ? r : _.values(r)));
            scheduleRecord.success = totalRunResults.every(r => this.isSuccess(r)) && this.compare(originRunResults, compareRunResults, schedule);
            scheduleRecord.schedule = schedule;
            scheduleRecord.result = { origin: originRunResults, compare: compareRunResults };
            scheduleRecord.isScheduleRun = isScheduleRun;
            scheduleRecord.duration = schedule.needOrder ? totalRunResults.map(r => r.elapsed).reduce((p, a) => p + a) : _.max(totalRunResults.map(r => r.elapsed));
            scheduleRecord.runDate = schedule.lastRunDate;
            log_1.Log.info('clear redundant records');
            yield schedule_record_service_1.ScheduleRecordService.clearRedundantRecords(schedule.id);
            log_1.Log.info('try clear record content');
            this.tryClearContent(originRunResults);
            this.tryClearContent(compareRunResults);
            log_1.Log.info('create new record');
            return yield schedule_record_service_1.ScheduleRecordService.create(scheduleRecord);
        });
    }
    tryClearContent(runResults) {
        return __awaiter(this, void 0, void 0, function* () {
            runResults.forEach(r => {
                if (this.isRunResult(r)) {
                    this.clearRunResult(r);
                }
                else {
                    _.values(r).forEach(s => {
                        this.clearRunResult(s);
                    });
                }
            });
        });
    }
    clearRunResult(runResult) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeContent = setting_1.Setting.instance.scheduleStoreContent;
            const isImg = validate_util_1.ValidateUtil.isResImg(runResult.headers);
            if (isImg || storeContent === 'none' || (storeContent === 'forFail' && this.isSuccess(runResult))) {
                runResult.body = '';
                runResult.headers = {};
            }
        });
    }
    flattenRunResult(res) {
        return _.flatten(res.map(r => this.isRunResult(r) ? r : _.values(r)));
    }
    compare(originRunResults, compareRunResults, schedule) {
        if (compareRunResults.length === 0) {
            return true;
        }
        if (originRunResults.length !== compareRunResults.length) {
            return false;
        }
        const notNeedMatchIds = schedule.recordsOrder ? schedule.recordsOrder.split(';').filter(r => r.endsWith(':0')).map(r => r.substr(0, r.length - 2)) : [];
        const compareDict = _.keyBy(this.flattenRunResult(compareRunResults), r => `${r.id}${r.param || ''}`);
        const originResults = this.flattenRunResult(originRunResults);
        for (let i = 0; i < originResults.length; i++) {
            const key = `${originResults[i].id}${originResults[i].param || ''}`;
            if (!notNeedMatchIds.some(id => id === originResults[i].id) && (!compareDict[key] || !this.compareExport(originResults[i], compareDict[key]))) {
                return false;
            }
        }
        return true;
    }
    compareExport(originRst, compareRst) {
        if (originRst.export !== sandbox_1.Sandbox.defaultExport &&
            compareRst.export !== sandbox_1.Sandbox.defaultExport) {
            return _.isEqual(originRst.export, compareRst.export);
        }
        return originRst.body === compareRst.body;
    }
    getAllSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield schedule_service_1.ScheduleService.getAllNeedRun();
            log_1.Log.info(`root schedules length is ${schedules.length}`);
            return schedules.filter(s => schedule_service_1.ScheduleService.checkScheduleNeedRun(s));
        });
    }
    isSuccess(runResult) {
        const testValues = _.values(runResult.tests);
        return !runResult.error && (testValues.length === 0 || testValues.reduce((p, a) => p && a)) && runResult.status < 500;
    }
}
exports.ScheduleRunner = ScheduleRunner;
//# sourceMappingURL=schedule_runner.js.map