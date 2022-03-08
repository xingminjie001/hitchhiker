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
const schedule_1 = require("../models/schedule");
const string_util_1 = require("../utils/string_util");
const connection_manager_1 = require("./connection_manager");
const message_1 = require("../common/message");
const user_collection_service_1 = require("./user_collection_service");
const schedule_record_service_1 = require("./schedule_record_service");
const schedule_record_1 = require("../models/schedule_record");
const period_1 = require("../interfaces/period");
const date_util_1 = require("../utils/date_util");
class ScheduleService {
    static fromDto(dtoSchedule) {
        const schedule = new schedule_1.Schedule();
        schedule.collectionId = dtoSchedule.collectionId;
        if (dtoSchedule.environmentId) {
            schedule.environmentId = dtoSchedule.environmentId;
        }
        schedule.needCompare = dtoSchedule.needCompare;
        schedule.compareEnvironmentId = dtoSchedule.compareEnvironmentId;
        schedule.emails = dtoSchedule.emails;
        schedule.hour = dtoSchedule.hour;
        schedule.id = dtoSchedule.id || string_util_1.StringUtil.generateUID();
        schedule.name = dtoSchedule.name;
        schedule.needOrder = dtoSchedule.needOrder;
        schedule.notification = dtoSchedule.notification;
        schedule.mailMode = dtoSchedule.mailMode;
        schedule.mailIncludeSuccessReq = dtoSchedule.mailIncludeSuccessReq;
        schedule.period = dtoSchedule.period;
        schedule.timer = dtoSchedule.timer;
        schedule.recordsOrder = dtoSchedule.recordsOrder;
        schedule.suspend = dtoSchedule.suspend;
        return schedule;
    }
    static toDto(schedule) {
        return Object.assign({}, schedule, { scheduleRecords: schedule.scheduleRecords ? schedule.scheduleRecords.map(s => schedule_record_service_1.ScheduleRecordService.toDto(s)) : [], ownerId: schedule.ownerId });
    }
    static save(schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(schedule_1.Schedule).save(schedule);
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(schedule_1.Schedule)
                .createQueryBuilder('schedule')
                .where('schedule.id=:id', { id: id })
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
            const schedules = yield connection.getRepository(schedule_1.Schedule)
                .createQueryBuilder('schedule')
                .leftJoinAndSelect('schedule.scheduleRecords', 'record')
                .where(whereStr, parameters)
                .getMany();
            schedules.forEach(s => {
                if (s.lastRunDate) {
                    s.lastRunDate = new Date(s.lastRunDate + ' UTC');
                }
                s.scheduleRecords.forEach(sr => {
                    if (new Date(sr.runDate).getFullYear() < 2000) {
                        sr.runDate = sr.createDate;
                    }
                    else {
                        sr.runDate = new Date(sr.runDate + ' UTC');
                    }
                });
            });
            return schedules;
        });
    }
    static getAllNeedRun() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(schedule_1.Schedule).find({ 'suspend': false });
        });
    }
    static createNew(dtoSchedule, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = ScheduleService.fromDto(dtoSchedule);
            schedule.ownerId = owner.id;
            yield ScheduleService.save(schedule);
            return { message: message_1.Message.get('scheduleCreateSuccess'), success: true };
        });
    }
    static update(dtoSchedule) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = ScheduleService.fromDto(dtoSchedule);
            yield ScheduleService.save(schedule);
            return { message: message_1.Message.get('scheduleUpdateSuccess'), success: true };
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.createQueryBuilder(schedule_record_1.ScheduleRecord, 'scheduleRecord')
                    .where('scheduleId=:id', { id })
                    .delete()
                    .execute();
                yield manager.createQueryBuilder(schedule_1.Schedule, 'schedule')
                    .where('id=:id', { id })
                    .delete()
                    .execute();
            }));
            yield connection.getRepository(schedule_1.Schedule)
                .createQueryBuilder('schedule')
                .where('id=:id', { id })
                .delete()
                .execute();
            return { success: true, message: message_1.Message.get('scheduleDeleteSuccess') };
        });
    }
    static checkScheduleNeedRun(schedule) {
        const now = new Date();
        if (schedule.timer === period_1.TimerType.Day) {
            const isRunFinish = schedule.lastRunDate && new Date(schedule.lastRunDate + ' UTC').toDateString() === new Date().toDateString();
            if (isRunFinish) {
                return false;
            }
            const UTCPeriod = schedule.hour >= 0 ? schedule.period : schedule.period - 1;
            const UTCDay = UTCPeriod === 1 ? 6 : UTCPeriod - 2;
            const isPeriodRight = schedule.period === 1 || UTCDay === now.getUTCDay();
            const scheduleHour = schedule.hour < 0 ? 24 + schedule.hour : schedule.hour;
            return isPeriodRight && scheduleHour === now.getUTCHours();
        }
        else if (schedule.timer === period_1.TimerType.Hour) {
            return !schedule.lastRunDate || date_util_1.DateUtil.diff(schedule.lastRunDate, date_util_1.DateUtil.getUTCDate(), 'h', 3000) >= schedule.hour;
        }
        else if (schedule.timer === period_1.TimerType.Minute) {
            const diff = date_util_1.DateUtil.diff(schedule.lastRunDate, date_util_1.DateUtil.getUTCDate(), 'm', 3000);
            return !schedule.lastRunDate || diff >= schedule.hour;
        }
        return false;
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule_service.js.map