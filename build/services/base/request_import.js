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
const swagger_import_1 = require("../importer/swagger_import");
const postman_import_1 = require("../importer/postman_import");
class Importer {
    static do(data, projectId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = Importer.getType(data);
            yield Importer.get(type).import(data, projectId, user);
        });
    }
    static get(type) {
        switch (type) {
            case 'swagger':
                return new swagger_import_1.SwaggerImport();
            case 'postman':
                return new postman_import_1.PostmanImport();
            default:
                throw new Error(`not support this type: ${type}`);
        }
    }
    static getType(data) {
        if (data.swagger) {
            return 'swagger';
        }
        else {
            return 'postman';
        }
    }
}
exports.Importer = Importer;
//# sourceMappingURL=request_import.js.map