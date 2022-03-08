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
const body_form_data_1 = require("../models/body_form_data");
class FormDataService {
    static fromDto(dtoFormData) {
        let formData = new body_form_data_1.BodyFormData();
        formData.key = dtoFormData.key;
        formData.value = dtoFormData.value;
        formData.isActive = dtoFormData.isActive;
        formData.sort = dtoFormData.sort;
        formData.id = dtoFormData.id || string_util_1.StringUtil.generateUID();
        formData.description = dtoFormData.description;
        return formData;
    }
    static clone(formData) {
        const target = Object.create(formData);
        target.id = undefined;
        return target;
    }
    static deleteForRecord(recordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(body_form_data_1.BodyFormData).createQueryBuilder('formData')
                .delete()
                .where('formData.record=:id', { id: recordId })
                .execute();
        });
    }
}
exports.FormDataService = FormDataService;
//# sourceMappingURL=form_data_service.js.map