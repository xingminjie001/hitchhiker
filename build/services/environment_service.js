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
const environment_1 = require("../models/environment");
const connection_manager_1 = require("./connection_manager");
const message_1 = require("../common/message");
const string_util_1 = require("../utils/string_util");
const variable_service_1 = require("./variable_service");
const project_1 = require("../models/project");
const stress_type_1 = require("../common/stress_type");
class EnvironmentService {
    static fromDto(dtoEnv) {
        const env = new environment_1.Environment();
        env.name = dtoEnv.name;
        env.id = dtoEnv.id || string_util_1.StringUtil.generateUID();
        env.variables = dtoEnv.variables.map(v => variable_service_1.VariableService.fromDto(v));
        env.project = new project_1.Project();
        env.project.id = dtoEnv.project.id;
        return env;
    }
    static save(env) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(environment_1.Environment).save(env);
        });
    }
    static formatVariables(env) {
        let variables = {};
        env.variables.forEach(o => {
            if (o.isActive) {
                variables[o.key] = o.value;
            }
        });
        return variables;
    }
    static get(id, needVars = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = yield connection.getRepository(environment_1.Environment).createQueryBuilder('env');
            if (needVars) {
                rep = rep.leftJoinAndSelect('env.variables', 'variable');
            }
            return yield rep.where('env.id=:id', { 'id': id }).getOne();
        });
    }
    static create(dtoEnv) {
        return __awaiter(this, void 0, void 0, function* () {
            const env = EnvironmentService.fromDto(dtoEnv);
            EnvironmentService.adjustVariables(env);
            yield EnvironmentService.save(env);
            return { success: true, message: message_1.Message.get('envCreateSuccess') };
        });
    }
    static adjustVariables(env) {
        env.variables.forEach((variable, index) => {
            variable.id = variable.id || string_util_1.StringUtil.generateUID();
            variable.sort = index;
        });
    }
    static getEnvironments(ids, needVariables = true, needProject = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0) {
                return [];
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(environment_1.Environment).createQueryBuilder('environment');
            if (needVariables) {
                rep = rep.leftJoinAndSelect('environment.variables', 'variable');
            }
            if (needProject) {
                rep = rep.leftJoinAndSelect('environment.project', 'project');
            }
            return yield rep.where('1=1')
                .andWhereInIds(ids.map(id => ({ id })))
                .getMany();
        });
    }
    static update(dtoEnv) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const env = yield EnvironmentService.get(dtoEnv.id, true);
            const newEnv = EnvironmentService.fromDto(dtoEnv);
            EnvironmentService.adjustVariables(newEnv);
            yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                if (env && env.variables && env.variables.length > 0) {
                    yield manager.remove(env.variables);
                }
                yield manager.save(newEnv);
            }));
            return { success: true, message: message_1.Message.get('envUpdateSuccess') };
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const env = yield EnvironmentService.get(id, true);
            if (env) {
                yield connection.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                    yield manager.remove(env.variables);
                    yield manager.remove(env);
                }));
            }
            return { success: true, message: message_1.Message.get('envDeleteSuccess') };
        });
    }
    static getVariables(envId) {
        return __awaiter(this, void 0, void 0, function* () {
            const envVariables = {};
            if (envId && envId !== stress_type_1.noEnvironment) {
                const env = yield EnvironmentService.get(envId, true);
                if (env) {
                    env.variables.forEach(v => {
                        if (v.isActive) {
                            envVariables[v.key] = v.value;
                        }
                    });
                }
            }
            return envVariables;
        });
    }
}
exports.EnvironmentService = EnvironmentService;
//# sourceMappingURL=environment_service.js.map