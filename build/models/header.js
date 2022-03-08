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
let Header = class Header {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], Header.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Header.prototype, "key", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Header.prototype, "value", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Header.prototype, "isActive", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Header.prototype, "isFav", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Header.prototype, "sort", void 0);
__decorate([
    typeorm_1.Column('text', { nullable: true }),
    __metadata("design:type", String)
], Header.prototype, "description", void 0);
__decorate([
    typeorm_1.ManyToOne(type => record_1.Record, record => record.id),
    __metadata("design:type", record_1.Record)
], Header.prototype, "record", void 0);
Header = __decorate([
    typeorm_1.Entity()
], Header);
exports.Header = Header;
//# sourceMappingURL=header.js.map