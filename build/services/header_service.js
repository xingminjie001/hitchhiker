"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const header_1 = require("../models/header");
const connection_manager_1 = require("./connection_manager");
const string_util_1 = require("../utils/string_util");
class HeaderService {
    static fromDto(dtoHeader) {
        let header = new header_1.Header();
        header.key = dtoHeader.key;
        header.value = dtoHeader.value;
        header.isActive = dtoHeader.isActive;
        header.isFav = dtoHeader.isFav;
        header.sort = dtoHeader.sort;
        header.description = dtoHeader.description;
        header.id = dtoHeader.id || string_util_1.StringUtil.generateUID();
        return header;
    }
    static clone(header) {
        const target = Object.create(header);
        target.id = undefined;
        return target;
    }
    static deleteForRecord(recordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(header_1.Header).createQueryBuilder('header')
                .delete()
                .where('header.record=:id', { id: recordId })
                .execute();
        });
    }
}
exports.HeaderService = HeaderService;
//# sourceMappingURL=header_service.js.map