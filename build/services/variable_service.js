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
const string_util_1 = require("../utils/string_util");
const environment_service_1 = require("./environment_service");
const variable_1 = require("../models/variable");
class VariableService {
    static create(key, value, isActive, sort, env) {
        const variable = new variable_1.Variable();
        variable.key = key;
        variable.value = value;
        variable.isActive = isActive;
        variable.sort = sort;
        variable.environment = env;
        return variable;
    }
    static fromDto(dtoVariable) {
        const variable = dtoVariable;
        variable.id = variable.id || string_util_1.StringUtil.generateUID();
        return variable;
    }
    static applyVariableForRecord(envId, r) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = Object.assign({}, r);
            const env = yield environment_service_1.EnvironmentService.get(envId, true);
            if (!env) {
                return record;
            }
            const variables = environment_service_1.EnvironmentService.formatVariables(env);
            record.url = string_util_1.StringUtil.applyTemplate(record.url, variables);
            record.body = string_util_1.StringUtil.applyTemplate(record.body, variables);
            record.test = string_util_1.StringUtil.applyTemplate(record.test, variables);
            record.prescript = string_util_1.StringUtil.applyTemplate(record.prescript, variables);
            record.headers = r.headers.map(header => (Object.assign({}, header, { key: string_util_1.StringUtil.applyTemplate(header.key, variables), value: string_util_1.StringUtil.applyTemplate(header.value, variables) })));
            record.queryStrings = r.queryStrings.map(queryString => (Object.assign({}, queryString, { key: string_util_1.StringUtil.applyTemplate(queryString.key, variables), value: string_util_1.StringUtil.applyTemplate(queryString.value, variables) })));
            record.formDatas = r.formDatas.map(formData => (Object.assign({}, formData, { key: string_util_1.StringUtil.applyTemplate(formData.key, variables), value: string_util_1.StringUtil.applyTemplate(formData.value, variables) })));
            return record;
        });
    }
    static applyVariable(envId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const env = yield environment_service_1.EnvironmentService.get(envId, true);
            if (!env) {
                return content;
            }
            const variables = environment_service_1.EnvironmentService.formatVariables(env);
            return string_util_1.StringUtil.applyTemplate(content, variables);
        });
    }
}
exports.VariableService = VariableService;
//# sourceMappingURL=variable_service.js.map