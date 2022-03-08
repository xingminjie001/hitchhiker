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
const notification_mode_1 = require("../interfaces/notification_mode");
const stress_record_1 = require("./stress_record");
let Stress = class Stress {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Stress.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Stress.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Stress.prototype, "collectionId", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Stress.prototype, "environmentId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Stress.prototype, "concurrencyCount", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Stress.prototype, "repeat", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Stress.prototype, "qps", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Stress.prototype, "timeout", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Stress.prototype, "keepAlive", void 0);
__decorate([
    typeorm_1.Column('json'),
    __metadata("design:type", Array)
], Stress.prototype, "requests", void 0);
__decorate([
    typeorm_1.Column('int', { default: 2 }),
    __metadata("design:type", Number)
], Stress.prototype, "notification", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Stress.prototype, "emails", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Stress.prototype, "ownerId", void 0);
__decorate([
    typeorm_1.OneToMany(type => stress_record_1.StressRecord, stressRecord => stressRecord.stress),
    __metadata("design:type", Array)
], Stress.prototype, "stressRecords", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Date)
], Stress.prototype, "lastRunDate", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Stress.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Stress.prototype, "updateDate", void 0);
Stress = __decorate([
    typeorm_1.Entity()
], Stress);
exports.Stress = Stress;
//# sourceMappingURL=stress.js.map