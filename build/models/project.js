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
const localhost_mapping_1 = require("./localhost_mapping");
const user_1 = require("./user");
const environment_1 = require("./environment");
let Project = class Project {
    constructor() {
        this.members = [];
        this.collections = [];
        this.environments = [];
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    typeorm_1.JoinTable(),
    typeorm_1.ManyToMany(type => user_1.User, user => user.projects),
    __metadata("design:type", Array)
], Project.prototype, "members", void 0);
__decorate([
    typeorm_1.JoinTable(),
    typeorm_1.OneToMany(type => localhost_mapping_1.LocalhostMapping, mapping => mapping.project),
    __metadata("design:type", Array)
], Project.prototype, "localhosts", void 0);
__decorate([
    typeorm_1.OneToMany(type => collection_1.Collection, collection => collection.project),
    __metadata("design:type", Array)
], Project.prototype, "collections", void 0);
__decorate([
    typeorm_1.OneToMany(type => environment_1.Environment, environment => environment.project),
    __metadata("design:type", Array)
], Project.prototype, "environments", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "globalFunction", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "note", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Project.prototype, "isMe", void 0);
__decorate([
    typeorm_1.JoinColumn(),
    typeorm_1.OneToOne(type => user_1.User),
    __metadata("design:type", user_1.User)
], Project.prototype, "owner", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Project.prototype, "createDate", void 0);
Project = __decorate([
    typeorm_1.Entity()
], Project);
exports.Project = Project;
//# sourceMappingURL=project.js.map