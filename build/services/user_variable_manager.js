"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserVariableManager {
    static getVariables(vid, envId) {
        if (vid && !UserVariableManager.variables[vid]) {
            UserVariableManager.variables[vid] = {};
        }
        if (envId && !UserVariableManager.variables[vid][envId]) {
            UserVariableManager.variables[vid][envId] = {};
        }
        return vid ? UserVariableManager.variables[vid][envId] : {};
    }
    static clearVariables(vid) {
        if (!vid) {
            return;
        }
        Reflect.deleteProperty(UserVariableManager.variables, vid);
    }
    static getCookies(vid, envId) {
        if (vid && !UserVariableManager.cookies[vid]) {
            UserVariableManager.cookies[vid] = {};
        }
        if (envId && !UserVariableManager.cookies[vid][envId]) {
            UserVariableManager.cookies[vid][envId] = {};
        }
        return vid ? UserVariableManager.cookies[vid][envId] : {};
    }
    static clearCookies(vid) {
        if (!vid) {
            return;
        }
        Reflect.deleteProperty(UserVariableManager.cookies, vid);
    }
}
UserVariableManager.variables = {};
UserVariableManager.cookies = {};
exports.UserVariableManager = UserVariableManager;
//# sourceMappingURL=user_variable_manager.js.map