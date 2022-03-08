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
const project_1 = require("./project");
let Collection = class Collection {
    constructor() {
        this.compatibleCommonPreScript = () => this.commonSetting ? (this.commonSetting.prescript || '') : (this.commonPreScript || '');
        this.commonTest = () => this.commonSetting ? (this.commonSetting.test || '') : '';
        this.commonHeaders = () => this.commonSetting ? (this.commonSetting.headers || []) : [];
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Collection.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Collection.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToMany(type => record_1.Record, record => record.collection, {
        cascadeInsert: true
    }),
    __metadata("design:type", Array)
], Collection.prototype, "records", void 0);
__decorate([
    typeorm_1.Column('mediumtext', { nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "commonPreScript", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "reqStrictSSL", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "reqFollowRedirect", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    typeorm_1.JoinColumn(),
    typeorm_1.OneToOne(type => user_1.User),
    __metadata("design:type", user_1.User)
], Collection.prototype, "owner", void 0);
__decorate([
    typeorm_1.ManyToOne(type => project_1.Project, project => project.collections),
    __metadata("design:type", project_1.Project)
], Collection.prototype, "project", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "recycle", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Collection.prototype, "public", void 0);
__decorate([
    typeorm_1.Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Collection.prototype, "commonSetting", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Collection.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Collection.prototype, "updateDate", void 0);
Collection = __decorate([
    typeorm_1.Entity()
], Collection);
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map