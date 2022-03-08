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
const schedule_record_1 = require("../models/schedule_record");
const connection_manager_1 = require("./connection_manager");
const setting_1 = require("../utils/setting");
const date_util_1 = require("../utils/date_util");
class ScheduleRecordService {
    static toDto(record) {
        return Object.assign({}, record, { scheduleId: record.schedule ? record.schedule.id : '' });
    }
    static create(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(schedule_record_1.ScheduleRecord).save(record);
        });
    }
    static get(scheduleId, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            return yield connection.getRepository(schedule_record_1.ScheduleRecord)
                .createQueryBuilder('record')
                .offset(setting_1.Setting.instance.schedulePageSize * page)
                .limit(setting_1.Setting.instance.schedulePageSize)
                .where('record.schedule=:id', { id: scheduleId })
                .orderBy('record.createDate', 'DESC')
                .getManyAndCount();
        });
    }
    static clearRedundantRecords(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { scheduleStoreLimit, scheduleStoreUnit } = setting_1.Setting.instance;
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const query = connection.getRepository(schedule_record_1.ScheduleRecord)
                .createQueryBuilder('record')
                .where('record.schedule=:id', { id: scheduleId })
                .orderBy('record.createDate', 'DESC');
            let records;
            if (scheduleStoreUnit === 'count') {
                records = yield query.limit(scheduleStoreLimit).getMany();
                if (records.length < scheduleStoreLimit) {
                    return;
                }
            }
            else {
                const minDate = new Date().getTime() - (24 * 60 * 60 * 1000) * scheduleStoreLimit;
                records = yield query.where('record.createDate>:date', { date: date_util_1.DateUtil.getUTCDate(new Date(minDate)) }).getMany();
            }
            const lastDate = date_util_1.DateUtil.getUTCDate(records[records.length - 1].createDate);
            yield connection.getRepository(schedule_record_1.ScheduleRecord)
                .createQueryBuilder('record')
                .where('scheduleId=:id', { id: scheduleId })
                .andWhere('createDate<=:date', { date: lastDate })
                .delete()
                .execute();
        });
    }
}
exports.ScheduleRecordService = ScheduleRecordService;
//# sourceMappingURL=schedule_record_service.js.map