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
const record_doc_history_1 = require("./record_doc_history");
let RecordDoc = class RecordDoc {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], RecordDoc.prototype, "id", void 0);
__decorate([
    typeorm_1.OneToOne(type => record_1.Record, record => record.doc),
    __metadata("design:type", record_1.Record)
], RecordDoc.prototype, "record", void 0);
__decorate([
    typeorm_1.OneToMany(type => record_doc_history_1.RecordDocHistory, history => history.target),
    __metadata("design:type", Array)
], RecordDoc.prototype, "history", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], RecordDoc.prototype, "version", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], RecordDoc.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], RecordDoc.prototype, "updateDate", void 0);
RecordDoc = __decorate([
    typeorm_1.Entity()
], RecordDoc);
exports.RecordDoc = RecordDoc;
//# sourceMappingURL=record_doc.js.map