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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const webapi_router_1 = require("webapi-router");
const project_service_1 = require("../services/project_service");
const Koa = require("koa");
const session_service_1 = require("../services/session_service");
const user_service_1 = require("../services/user_service");
const message_1 = require("../common/message");
const token_service_1 = require("../services/token_service");
const mail_service_1 = require("../services/mail_service");
const user_project_service_1 = require("../services/user_project_service");
const validate_util_1 = require("../utils/validate_util");
const _ = require("lodash");
const setting_1 = require("../utils/setting");
const multer = require("koa-multer");
const project_data_service_1 = require("../services/project_data_service");
class ProjectController extends webapi_router_1.BaseController {
    create(ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield project_service_1.ProjectService.createProject(info, session_service_1.SessionService.getUserId(ctx));
        });
    }
    update(info) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield project_service_1.ProjectService.updateProject(info);
        });
    }
    quitProject(ctx, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_project_service_1.UserProjectService.quitProject({ userId: session_service_1.SessionService.getUserId(ctx), projectId });
        });
    }
    removeUser(ctx, projectId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_project_service_1.UserProjectService.quitProject({ userId, projectId });
        });
    }
    disbandProject(ctx, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session_service_1.SessionService.getUserId(ctx);
            return yield user_project_service_1.UserProjectService.disbandProject({ userId, projectId });
        });
    }
    addLocalhost(ctx, id, projectId, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = session_service_1.SessionService.getUserId(ctx);
            return yield project_service_1.ProjectService.createLocalhostMapping(id, userId, projectId, ip);
        });
    }
    updateLocalhost(id, ip) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield project_service_1.ProjectService.updateLocalhostMapping(id, ip);
        });
    }
    join(ctx, projectId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRst = yield this.validateInfo(projectId, token);
            if (!validateRst.success) {
                return validateRst.message;
            }
            const data = validateRst.result;
            if (data.user.projects.find(o => o.id === projectId)) {
                return message_1.Message.get('alreadyInProject');
            }
            data.user.projects.push(data.project);
            yield user_service_1.UserService.save(data.user);
            mail_service_1.MailService.joinProjectMail(data.info.inviterEmail, data.info.userEmail, data.project.name);
            ctx.redirect(setting_1.Setting.instance.appHost);
        });
    }
    reject(projectId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRst = yield this.validateInfo(projectId, token);
            if (!validateRst.success) {
                return validateRst;
            }
            const data = validateRst.result;
            mail_service_1.MailService.rejectProjectMail(data.info.inviterEmail, data.info.userEmail, data.project.name);
            return message_1.Message.get('rejectProjectSuccess');
        });
    }
    validateInfo(projectId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token_service_1.TokenService.isValidToken(token)) {
                return { success: false, message: message_1.Message.get('tokenInvalid') };
            }
            const info = token_service_1.TokenService.parseToken(token);
            if (projectId !== info.projectId) {
                return { success: false, message: message_1.Message.get('tokenInvalid') };
            }
            const project = yield project_service_1.ProjectService.getProject(projectId);
            if (!project) {
                return { success: false, message: message_1.Message.get('projectNotExist') };
            }
            token_service_1.TokenService.removeToken(token);
            const user = yield user_service_1.UserService.getUserByEmail(info.userEmail, true);
            const userRst = user || (yield user_service_1.UserService.createUserByEmail(info.userEmail, true)).result;
            return { success: true, message: '', result: { info: info, user: userRst, project: project } };
        });
    }
    inviteToProject(ctx, projectId, emailInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkEmailsRst = validate_util_1.ValidateUtil.checkEmails(emailInfo.emails);
            if (!checkEmailsRst.success) {
                return checkEmailsRst;
            }
            let emailArr = checkEmailsRst.result;
            const project = yield project_service_1.ProjectService.getProject(projectId, false, true);
            if (!project) {
                return { success: false, message: message_1.Message.get('projectNotExist') };
            }
            emailArr = _.difference(emailArr, project.members.map(t => t.email));
            if (emailArr.length === 0) {
                return { success: false, message: message_1.Message.get('emailsAllInProject') };
            }
            const user = ctx.session.user;
            let result;
            if (setting_1.Setting.instance.inviteMemberDirectly) {
                const results = yield Promise.all(emailArr.map(email => this.joinProjectDirectly(email, project, user.email)));
                result = { success: results.every(rst => rst.success), message: results.filter(r => !r.success).map(rst => rst.message).join(';') };
            }
            else {
                const results = yield Promise.all(emailArr.map(email => mail_service_1.MailService.projectInviterMail(email, user, project)));
                const success = results.every(rst => !rst || !rst.err);
                result = { success: success, message: results.map(rst => rst ? rst.err : '').join(';') };
            }
            return result;
        });
    }
    joinProjectDirectly(email, project, inviter) {
        return __awaiter(this, void 0, void 0, function* () {
            let targetUser = yield user_service_1.UserService.getUserByEmail(email, true);
            if (!targetUser) {
                const result = yield user_service_1.UserService.createUserByEmail(email, true);
                if (!result.success) {
                    return result;
                }
                targetUser = result.result;
            }
            targetUser.projects.push(project);
            yield user_service_1.UserService.save(targetUser);
            mail_service_1.MailService.joinProjectMail(inviter, email, project.name);
            return { success: true, message: '' };
        });
    }
    updateGlobalFunction(projectId, globalFunc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield project_service_1.ProjectService.updateGlobalFunc(projectId, globalFunc.content);
        });
    }
    deleteProjectFile(projectId, type, name) {
        project_data_service_1.ProjectDataService.instance.removeFile(type, projectId, name);
        return { success: true, message: message_1.Message.get('deleteProjectFileSuccess') };
    }
    uploadProjectFile(ctx, projectId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!setting_1.Setting.instance.enableUpload) {
                return;
            }
            let fileName;
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    project_data_service_1.ProjectDataService.instance.prepareProjectFolder(projectId);
                    cb(null, project_data_service_1.ProjectDataService.instance.getProjectFile(projectId, '', type));
                },
                filename: function (req, file, cb) {
                    fileName = file.originalname;
                    cb(null, file.originalname);
                }
            });
            const upload = multer({
                storage,
                fileFilter: (req, file, cb) => this.updateFileFilter(type, req, file, cb),
                limits: { filedSize: 1024 * 1024 * 100 }
            });
            try {
                yield upload.single('projectfile')(ctx);
                project_data_service_1.ProjectDataService.instance.handleUploadFile(projectId, fileName, type);
                ctx.status = 200;
            }
            catch (err) {
                ctx.status = 500;
                ctx.body = err;
            }
        });
    }
    updateFileFilter(type, req, file, cb) {
        if (type === 'lib' && !file.originalname.endsWith('.zip')) {
            cb(new Error('only support zip file for js lib.'));
        }
        else {
            cb(null, true);
        }
    }
}
__decorate([
    webapi_router_1.POST('/project'),
    __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    webapi_router_1.PUT('/project'),
    __param(0, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    webapi_router_1.DELETE('/project/:tid/own'),
    __param(1, webapi_router_1.PathParam('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "quitProject", null);
__decorate([
    webapi_router_1.DELETE('/project/:tid/user/:uid'),
    __param(1, webapi_router_1.PathParam('tid')), __param(2, webapi_router_1.PathParam('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "removeUser", null);
__decorate([
    webapi_router_1.DELETE('/project/:tid'),
    __param(1, webapi_router_1.PathParam('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "disbandProject", null);
__decorate([
    webapi_router_1.POST('/project/:pid/localhost/:id/ip/:ip'),
    __param(1, webapi_router_1.PathParam('id')), __param(2, webapi_router_1.PathParam('pid')), __param(3, webapi_router_1.PathParam('ip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "addLocalhost", null);
__decorate([
    webapi_router_1.PUT('/project/:pid/localhost/:id/ip/:ip'),
    __param(0, webapi_router_1.PathParam('id')), __param(1, webapi_router_1.PathParam('ip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateLocalhost", null);
__decorate([
    webapi_router_1.GET('/project/join'),
    __param(1, webapi_router_1.QueryParam('projectid')), __param(2, webapi_router_1.QueryParam('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "join", null);
__decorate([
    webapi_router_1.GET('/project/reject'),
    __param(0, webapi_router_1.QueryParam('projectid')), __param(1, webapi_router_1.QueryParam('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "reject", null);
__decorate([
    webapi_router_1.POST('/project/:tid'),
    __param(1, webapi_router_1.PathParam('tid')), __param(2, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "inviteToProject", null);
__decorate([
    webapi_router_1.PUT('/project/:projectId/globalfunc'),
    __param(0, webapi_router_1.PathParam('projectId')), __param(1, webapi_router_1.BodyParam),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateGlobalFunction", null);
__decorate([
    webapi_router_1.DELETE('/project/:projectId/file/:type/:name'),
    __param(0, webapi_router_1.PathParam('projectId')), __param(1, webapi_router_1.PathParam('type')), __param(2, webapi_router_1.PathParam('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Object)
], ProjectController.prototype, "deleteProjectFile", null);
__decorate([
    webapi_router_1.POST('/project/:projectId/:type'),
    __param(1, webapi_router_1.PathParam('projectId')), __param(2, webapi_router_1.PathParam('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "uploadProjectFile", null);
exports.default = ProjectController;
//# sourceMappingURL=project_controller.js.map