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
const collection_service_1 = require("./collection_service");
const environment_service_1 = require("./environment_service");
const string_util_1 = require("../utils/string_util");
const record_service_1 = require("./record_service");
const postman_import_1 = require("./importer/postman_import");
const _ = require("lodash");
class SampleService {
    static init() {
        if (!!SampleService.sampleCollection) {
            return;
        }
        SampleService.sampleCollection = require('../../sample collection.json');
    }
    static createSampleForUser(owner, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            SampleService.init();
            const collection = yield new postman_import_1.PostmanImport().parsePostmanCollectionV1(owner, projectId, _.cloneDeep(SampleService.sampleCollection));
            yield collection_service_1.CollectionService.save(collection);
            yield Promise.all(collection.records.map(r => record_service_1.RecordService.saveRecordHistory(record_service_1.RecordService.createRecordHistory(r, owner))));
            const dtoEnv = { id: string_util_1.StringUtil.generateUID(), name: 'Sample Env', project: { id: projectId }, variables: [{ id: string_util_1.StringUtil.generateUID(), key: 'apihost', value: 'http://httpbin.org', isActive: true, sort: 0 }, { id: string_util_1.StringUtil.generateUID(), key: 'string', value: 'test', isActive: true, sort: 1 }] };
            yield environment_service_1.EnvironmentService.create(dtoEnv);
        });
    }
}
exports.SampleService = SampleService;
//# sourceMappingURL=sample_service.js.map