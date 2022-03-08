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
const connection_manager_1 = require("./connection_manager");
const setting_1 = require("../utils/setting");
const date_util_1 = require("../utils/date_util");
const stress_record_1 = require("../models/stress_record");
const stress_failed_info_1 = require("../models/stress_failed_info");
class StressRecordService {
    static toDto(record) {
        return Object.assign({}, record, { stressId: record.stress ? record.stress.id : '' });
    }
    static create(record, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const result = yield connection.getRepository(stress_record_1.StressRecord).save(record);
            yield connection.getRepository(stress_failed_info_1.StressFailedInfo).save({ id: result.id, info: JSON.stringify(info) });
            return result;
        });
    }
    static clearRedundantRecords(stressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxCount = setting_1.Setting.instance.stressMaxCount;
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const records = yield connection.getRepository(stress_record_1.StressRecord)
                .createQueryBuilder('record')
                .limit(maxCount)
                .where('record.stress=:id', { id: stressId })
                .orderBy('record.createDate', 'DESC')
                .getMany();
            if (records.length < maxCount) {
                return;
            }
            const lastDate = date_util_1.DateUtil.getUTCDate(records[maxCount - 1].createDate);
            yield connection.getRepository(stress_record_1.StressRecord)
                .createQueryBuilder('record')
                .where('stressId=:id', { id: stressId })
                .andWhere('createDate<=:date', { date: lastDate })
                .delete()
                .execute();
        });
    }
}
exports.StressRecordService = StressRecordService;
//# sourceMappingURL=stress_record_service.js.map