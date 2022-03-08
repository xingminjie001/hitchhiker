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
const record_1 = require("./record");
const user_1 = require("./user");
let RecordHistory = class RecordHistory {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], RecordHistory.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => record_1.Record, record => record.history),
    __metadata("design:type", record_1.Record)
], RecordHistory.prototype, "target", void 0);
__decorate([
    typeorm_1.Column('json'),
    __metadata("design:type", record_1.Record)
], RecordHistory.prototype, "record", void 0);
__decorate([
    typeorm_1.ManyToOne(type => user_1.User),
    typeorm_1.JoinColumn({ name: 'userId' }),
    __metadata("design:type", user_1.User)
], RecordHistory.prototype, "user", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], RecordHistory.prototype, "userId", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], RecordHistory.prototype, "createDate", void 0);
RecordHistory = __decorate([
    typeorm_1.Entity()
], RecordHistory);
exports.RecordHistory = RecordHistory;
//# sourceMappingURL=record_history.js.map