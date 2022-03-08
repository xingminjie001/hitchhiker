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
const user_1 = require("../models/user");
const connection_manager_1 = require("./connection_manager");
const message_1 = require("../common/message");
const validate_util_1 = require("../utils/validate_util");
const setting_1 = require("../utils/setting");
const mail_service_1 = require("./mail_service");
const string_util_1 = require("../utils/string_util");
const project_service_1 = require("./project_service");
const _ = require("lodash");
const user_project_service_1 = require("./user_project_service");
const sample_service_1 = require("./sample_service");
class UserService {
    static create(name, email, password) {
        const user = new user_1.User();
        user.name = name;
        user.email = email;
        user.password = string_util_1.StringUtil.md5Password(password);
        user.id = string_util_1.StringUtil.generateUID();
        return user;
    }
    static save(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(user_1.User).save(user);
        });
    }
    static checkUser(email, pwd, isMd5Pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserService.getUserByEmail(email, true);
            if (user && (isMd5Pwd || user.password === string_util_1.StringUtil.md5Password(pwd))) {
                if (user.isActive) {
                    const userInfo = yield user_project_service_1.UserProjectService.getUserInfo(user);
                    return { success: true, message: '', result: userInfo };
                }
                else {
                    return { success: false, message: message_1.Message.get('accountNotActive') };
                }
            }
            return { success: false, message: message_1.Message.get('userCheckFailed') };
        });
    }
    static checkUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserService.getUserById(userId, false);
            return { success: !!user, message: !!user ? '' : message_1.Message.get('userNotExist'), result: user };
        });
    }
    static createUser(name, email, pwd, isAutoGenerate = false, isTemp = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let checkRst = validate_util_1.ValidateUtil.checkEmail(email);
            if (checkRst.success) {
                checkRst = validate_util_1.ValidateUtil.checkPassword(pwd);
            }
            if (checkRst.success) {
                checkRst = validate_util_1.ValidateUtil.checkUserName(name);
            }
            if (!checkRst.success) {
                return checkRst;
            }
            const isEmailExist = yield UserService.IsUserEmailExist(email);
            if (isEmailExist) {
                return { success: false, message: message_1.Message.get('userEmailRepeat') };
            }
            const user = UserService.create(name, email, pwd);
            user.isActive = isAutoGenerate || !setting_1.Setting.instance.needRegisterMailConfirm;
            user.isTemp = isTemp;
            yield UserService.save(user);
            if (!user.isActive) {
                mail_service_1.MailService.registerMail(user);
            }
            const project = yield project_service_1.ProjectService.createOwnProject(user);
            yield sample_service_1.SampleService.createSampleForUser(user, project.id);
            return { success: true, message: setting_1.Setting.instance.needRegisterMailConfirm ? message_1.Message.get('regSuccessNeedConfirm') : message_1.Message.get('regSuccess'), result: user };
        });
    }
    static createUserByEmail(email, isAutoGenerate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let checkRst = validate_util_1.ValidateUtil.checkEmail(email);
            if (!checkRst.success) {
                return checkRst;
            }
            const name = email.substr(0, email.indexOf('@'));
            const password = setting_1.Setting.instance.app.defaultPassword;
            return yield UserService.createUser(name, email, password, isAutoGenerate);
        });
    }
    static IsUserEmailExist(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserService.getUserByEmail(email);
            return user !== undefined;
        });
    }
    static getUserByEmail(email, needProject) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            let rep = connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .where(`user.email = :email`)
                .setParameter('email', email);
            if (needProject) {
                rep = rep.leftJoinAndSelect('user.projects', 'project');
            }
            ;
            const user = yield rep.getOne();
            if (user && needProject) {
                user.projects = yield project_service_1.ProjectService.getProjects(user.projects.map(t => t.id), true, false, true, true);
            }
            return user;
        });
    }
    static getUserById(id, needProject) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const user = yield connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.projects', 'project')
                .where(`user.id = :id`)
                .setParameter('id', id)
                .getOne();
            if (user && needProject) {
                user.projects = yield project_service_1.ProjectService.getProjects(user.projects.map(t => t.id), true, false, true, true);
            }
            return user;
        });
    }
    static getNameByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0) {
                return {};
            }
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const users = yield connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .where('1=1')
                .andWhereInIds(ids.map(id => ({ id })))
                .getMany();
            const userDict = {};
            users.forEach(u => { u.password = ''; userDict[u.id] = u; });
            return userDict;
        });
    }
    static active(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .update({ isActive: true })
                .where('id=:id')
                .setParameter('id', id)
                .execute();
        });
    }
    static changePwd(id, newPwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            yield connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .update({ password: string_util_1.StringUtil.md5Password(newPwd) })
                .where('id=:id')
                .setParameter('id', id)
                .execute();
            return { success: true, message: message_1.Message.get('userChangePwdSuccess') };
        });
    }
    static deleteTempUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield connection_manager_1.ConnectionManager.getInstance();
            const users = yield connection.getRepository(user_1.User)
                .createQueryBuilder('user')
                .where(`user.isTemp = true`)
                .leftJoinAndSelect('user.projects', 'project')
                .getMany();
            if (!users || users.length === 0) {
                return;
            }
            const ids = _.flatten(users.map(u => u.projects)).map(p => p.id);
            for (let i = 0; i < ids.length; i++) {
                yield project_service_1.ProjectService.delete(ids[i], true, true);
            }
            yield Promise.all(users.map(u => connection.manager.remove(u)));
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user_service.js.map