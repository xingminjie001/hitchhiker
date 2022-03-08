"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const user_variable_manager_1 = require("../services/user_variable_manager");
const setting_1 = require("../utils/setting");
const project_data_service_1 = require("../services/project_data_service");
const string_util_1 = require("../utils/string_util");
class SandboxRequest {
}
class Console {
    constructor() {
        this.msgQueue = [];
    }
    write(type, msg) {
        this.msgQueue.push({ time: new Date(), type, message: msg, custom: true });
    }
    log(msg) {
        this.write('log', msg);
    }
    info(msg) {
        this.write('info', msg);
    }
    warn(msg) {
        this.write('warn', msg);
    }
    error(msg) {
        this.write('error', msg);
    }
}
class Sandbox {
    constructor(projectId, vid, envId, envName, envVariables, record) {
        this.projectId = projectId;
        this.vid = vid;
        this.envId = envId;
        this.envName = envName;
        this.envVariables = envVariables;
        this._allProjectJsFiles = {};
        this.console = new Console();
        this.tests = {};
        this.exportObj = { content: Sandbox.defaultExport };
        this.initVariables();
        this._allProjectJsFiles = project_data_service_1.ProjectDataService.instance.getProjectAllJSFiles(projectId);
        if (record) {
            this.request = {
                url: string_util_1.StringUtil.stringifyUrl(record.url, record.queryStrings),
                method: record.method || 'GET',
                body: record.body,
                formDatas: {},
                headers: {}
            };
            record.headers.filter(h => h.isActive).forEach(h => {
                this.request.headers[h.key] = h.value;
            });
            record.formDatas.filter(h => h.isActive).forEach(f => {
                this.request.formDatas[f.key] = f.value;
            });
        }
    }
    initVariables() {
        this.variables = user_variable_manager_1.UserVariableManager.getVariables(this.vid, this.envId);
    }
    getProjectFile(file, type) {
        return path.join(__dirname, `../global_data/${this.projectId}/${type}/${file}`);
    }
    require(lib) {
        if (setting_1.Setting.instance.safeVM) {
            throw new Error('not support [require] in SafeVM mode, you can set it to false in config file if you want to use [require].');
        }
        if (!this._allProjectJsFiles[lib]) {
            throw new Error(`no valid js lib named [${lib}], you should upload this lib first.`);
        }
        let libPath = this._allProjectJsFiles[lib].path;
        if (!fs.existsSync(libPath)) {
            throw new Error(`[${libPath}] does not exist.`);
        }
        const stat = fs.statSync(libPath);
        if (stat.isDirectory()) {
            const subFiles = fs.readdirSync(libPath);
            if (subFiles.length === 1 && fs.statSync(path.join(libPath, subFiles[0])).isDirectory()) {
                libPath = path.join(libPath, subFiles[0]);
            }
        }
        return require(libPath);
    }
    readFile(file) {
        return this.readFileByReader(file, f => fs.readFileSync(f, 'utf8'));
    }
    readFileByReader(file, reader) {
        if (project_data_service_1.ProjectDataService.instance._pDataFiles[this.projectId] &&
            project_data_service_1.ProjectDataService.instance._pDataFiles[this.projectId][file]) {
            return reader(project_data_service_1.ProjectDataService.instance._pDataFiles[this.projectId][file].path);
        }
        if (project_data_service_1.ProjectDataService.instance._gDataFiles[file]) {
            return reader(project_data_service_1.ProjectDataService.instance._gDataFiles[file].path);
        }
        throw new Error(`${file} not exists.`);
    }
    saveFile(file, content, replaceIfExist = true) {
        project_data_service_1.ProjectDataService.instance.saveDataFile(this.projectId, file, content, replaceIfExist);
    }
    removeFile(file) {
        project_data_service_1.ProjectDataService.instance.removeFile(project_data_service_1.ProjectDataService.dataFolderName, this.projectId, file);
    }
    setEnvVariable(key, value) {
        this.variables[key] = value;
    }
    getEnvVariable(key) {
        return this.variables[key] || this.envVariables[key];
    }
    removeEnvVariable(key) {
        Reflect.deleteProperty(this.variables, key);
    }
    setRequest(r) {
        this.request = r;
    }
    get environment() {
        return this.envName;
    }
    export(obj) {
        this.exportObj.content = obj;
    }
    ;
}
Sandbox.defaultExport = 'export:impossiblethis:tropxe';
exports.Sandbox = Sandbox;
//# sourceMappingURL=sandbox.js.map