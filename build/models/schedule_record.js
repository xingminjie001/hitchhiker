"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const schedule_1 = require("./schedule");
let ScheduleRecord = class ScheduleRecord {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ScheduleRecord.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => schedule_1.Schedule, schedule => schedule.scheduleRecords),
    __metadata("design:type", schedule_1.Schedule)
], ScheduleRecord.prototype, "schedule", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], ScheduleRecord.prototype, "duration", void 0);
__decorate([
    typeorm_1.Column('json'),
    __metadata("design:type", Object)
], ScheduleRecord.prototype, "result", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], ScheduleRecord.prototype, "success", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], ScheduleRecord.prototype, "isScheduleRun", void 0);
__decorate([
    typeorm_1.Column({ default: () => `'1949-10-01'` }),
    __metadata("design:type", Date)
], ScheduleRecord.prototype, "runDate", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], ScheduleRecord.prototype, "createDate", void 0);
ScheduleRecord = __decorate([
    typeorm_1.Entity()
], ScheduleRecord);
exports.ScheduleRecord = ScheduleRecord;
//# sourceMappingURL=schedule_record.js.map