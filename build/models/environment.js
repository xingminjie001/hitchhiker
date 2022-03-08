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
const variable_1 = require("./variable");
const project_1 = require("./project");
let Environment = class Environment {
    constructor() {
        this.variables = [];
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Environment.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Environment.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToMany(type => variable_1.Variable, variable => variable.environment, {
        cascadeInsert: true,
        cascadeUpdate: true
    }),
    __metadata("design:type", Array)
], Environment.prototype, "variables", void 0);
__decorate([
    typeorm_1.ManyToOne(type => project_1.Project, project => project.environments),
    __metadata("design:type", project_1.Project)
], Environment.prototype, "project", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Environment.prototype, "createDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Environment.prototype, "updateDate", void 0);
Environment = __decorate([
    typeorm_1.Entity()
], Environment);
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map