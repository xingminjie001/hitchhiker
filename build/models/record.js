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
const collection_1 = require("./collection");
const header_1 = require("./header");
const query_string_1 = require("./query_string");
const record_category_1 = require("../common/record_category");
const data_mode_1 = require("../common/data_mode");
const parameter_type_1 = require("../common/parameter_type");
const record_doc_1 = require("./record_doc");
const record_history_1 = require("./record_history");
const body_form_data_1 = require("./body_form_data");
let Record = class Record {
    constructor() {
        this.queryStrings = [];
        this.headers = [];
        this.formDatas = [];
        this.children = [];
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Record.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => collection_1.Collection, collection => collection.records),
    __metadata("design:type", collection_1.Collection)
], Record.prototype, "collection", void 0);
__decorate([
    typeorm_1.JoinColumn(),
    typeorm_1.OneToOne(type => record_doc_1.RecordDoc, doc => doc.record, {
        cascadeInsert: true,
        cascadeRemove: true
    }),
    __metadata("design:type", record_doc_1.RecordDoc)
], Record.prototype, "doc", void 0);
__decorate([
    typeorm_1.OneToMany(type => record_history_1.RecordHistory, history => history.target),
    __metadata("design:type", Array)
], Record.prototype, "history", void 0);
__decorate([
    typeorm_1.Column('json'),
    __metadata("design:type", Object)
], Record.prototype, "assertInfos", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, default: '' }),
    __metadata("design:type", String)
], Record.prototype, "pid", void 0);
__decorate([
    typeorm_1.Column('int', { default: 20 }),
    __metadata("design:type", Number)
], Record.prototype, "category", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Record.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ length: 2000, nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "url", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, default: 'GET' }),
    __metadata("design:type", String)
], Record.prototype, "method", void 0);
__decorate([
    typeorm_1.OneToMany(type => query_string_1.QueryString, queryString => queryString.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    }),
    __metadata("design:type", Array)
], Record.prototype, "queryStrings", void 0);
__decorate([
    typeorm_1.OneToMany(type => header_1.Header, header => header.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    }),
    __metadata("design:type", Array)
], Record.prototype, "headers", void 0);
__decorate([
    typeorm_1.OneToMany(type => body_form_data_1.BodyFormData, form => form.record, {
        cascadeInsert: true,
        cascadeUpdate: true
    }),
    __metadata("design:type", Array)
], Record.prototype, "formDatas", void 0);
__decorate([
    typeorm_1.Column('mediumtext', { nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "body", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true, length: 50 }),
    __metadata("design:type", String)
], Record.prototype, "bodyType", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "parameters", void 0);
__decorate([
    typeorm_1.Column('int', { default: 0 }),
    __metadata("design:type", Number)
], Record.prototype, "reduceAlgorithm", void 0);
__decorate([
    typeorm_1.Column('int', { default: 0 }),
    __metadata("design:type", Number)
], Record.prototype, "parameterType", void 0);
__decorate([
    typeorm_1.Column({ default: 1, type: 'int' }),
    __metadata("design:type", Number)
], Record.prototype, "dataMode", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "prescript", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "test", void 0);
__decorate([
    typeorm_1.Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Record.prototype, "sort", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Record.prototype, "version", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Record.prototype, "description", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Record.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Record.prototype, "updateDate", void 0);
Record = __decorate([
    typeorm_1.Entity()
], Record);
exports.Record = Record;
class RecordEx extends Record {
}
exports.RecordEx = RecordEx;
//# sourceMappingURL=record.js.map