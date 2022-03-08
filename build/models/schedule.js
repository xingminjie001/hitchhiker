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
const period_1 = require("../interfaces/period");
const notification_mode_1 = require("../interfaces/notification_mode");
const schedule_record_1 = require("./schedule_record");
let Schedule = class Schedule {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Schedule.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Schedule.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Schedule.prototype, "collectionId", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "environmentId", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Schedule.prototype, "needCompare", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "compareEnvironmentId", void 0);
__decorate([
    typeorm_1.Column('int', { default: 3 }),
    __metadata("design:type", Number)
], Schedule.prototype, "timer", void 0);
__decorate([
    typeorm_1.Column('int', { default: 1 }),
    __metadata("design:type", Number)
], Schedule.prototype, "period", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Schedule.prototype, "hour", void 0);
__decorate([
    typeorm_1.Column('int', { default: 2 }),
    __metadata("design:type", Number)
], Schedule.prototype, "notification", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Schedule.prototype, "emails", void 0);
__decorate([
    typeorm_1.Column('int', { default: 1 }),
    __metadata("design:type", Number)
], Schedule.prototype, "mailMode", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Schedule.prototype, "mailIncludeSuccessReq", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Schedule.prototype, "needOrder", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Schedule.prototype, "recordsOrder", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Schedule.prototype, "suspend", void 0);
__decorate([
    typeorm_1.OneToMany(type => schedule_record_1.ScheduleRecord, scheduleRecord => scheduleRecord.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "scheduleRecords", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Schedule.prototype, "ownerId", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Date)
], Schedule.prototype, "lastRunDate", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Schedule.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Schedule.prototype, "updateDate", void 0);
Schedule = __decorate([
    typeorm_1.Entity()
], Schedule);
exports.Schedule = Schedule;
//# sourceMappingURL=schedule.js.map