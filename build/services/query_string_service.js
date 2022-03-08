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
const connection_manager_1 = require("./connection_manager");
const string_util_1 = require("../utils/string_util");
const query_string_1 = require("../models/query_string");
class QueryStringService {
    static fromDto(dtoQueryString) {
        let queryString = new query_string_1.QueryString();
        queryString.key = dtoQueryString.key;
        queryString.value = dtoQueryString.value;
        queryString.isActive = dtoQueryString.isActive;
        queryString.sort = dtoQueryString.sort;
        queryString.id = dtoQueryString.id || string_util_1.StringUtil.generateUID();
        queryString.description = dtoQueryString.description;
        return queryString;
    }
    static clone(queryString) {
        const target = Object.create(queryString);
        target.id = undefined;
        return target;
    }
    static deleteForRecord(recordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(query_string_1.QueryString).createQueryBuilder('queryString')
                .delete()
                .where('queryString.record=:id', { id: recordId })
                .execute();
        });
    }
}
exports.QueryStringService = QueryStringService;
//# sourceMappingURL=query_string_service.js.map