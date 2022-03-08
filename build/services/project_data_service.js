"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const fs = require("fs-extra");
const AdmZip = require("adm-zip");
const child_process_manager_1 = require("../run_engine/process/child_process_manager");
class ProjectDataService {
    constructor() {
        this._pJsFiles = {};
        this._pDataFiles = {};
        this._gJsFiles = {};
        this._gDataFiles = {};
        this.initGlobalFiles();
        this.initProjectFiles();
    }
    init() {
        // TODO: watch folder change
        // fs.watch(ProjectDataService.globalFolder, { recursive: true }, (event, fileName) => {
        // });
    }
    reload() {
        this.clearAll();
        this.initGlobalFiles();
        this.initProjectFiles();
    }
    notifyLibsChanged() {
        const handler = child_process_manager_1.ChildProcessManager.default.getHandler('schedule');
        if (handler) {
            handler.reloadLib();
        }
    }
    getProjectAllJSFiles(projectId) {
        const allJSFiles = {};
        _.keys(this._gJsFiles).forEach(k => allJSFiles[k] = this._gJsFiles[k]);
        if (this._pJsFiles[projectId]) {
            _.keys(this._pJsFiles[projectId]).forEach(k => allJSFiles[k] = this._pJsFiles[projectId][k]);
        }
        return allJSFiles;
    }
    saveDataFile(pid, file, content, replaceIfExist = true) {
        if (!this._pDataFiles[pid]) {
            this._pDataFiles[pid] = {};
            this.prepareProjectFolder(pid);
        }
        if (!replaceIfExist && this._pDataFiles[pid][file]) {
            return;
        }
        const projectFile = this.getProjectFile(pid, file, ProjectDataService.dataFolderName);
        fs.writeFileSync(projectFile, content);
        const size = Buffer.byteLength(content || '', 'utf8');
        this._pDataFiles[pid][file] = { name: file, path: projectFile, createdDate: new Date(), size };
    }
    prepareProjectFolder(pid) {
        const projectFolder = this.getProjectFolder(pid);
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder, 0o666);
            fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.libFolderName), 0o666);
            fs.mkdirSync(this.getActualPath(projectFolder, ProjectDataService.dataFolderName), 0o666);
        }
    }
    handleUploadFile(pid, file, type) {
        if (type === 'lib') {
            this.unZipJS(pid, file);
        }
        else {
            const projectFile = this.getProjectFile(pid, file, ProjectDataService.dataFolderName);
            if (!this._pDataFiles[pid]) {
                this._pDataFiles[pid] = {};
            }
            this._pDataFiles[pid][file] = { name: file, path: projectFile, createdDate: new Date(), size: 0 };
        }
        this.notifyLibsChanged();
    }
    unZipJS(pid, file) {
        const projectFile = this.getProjectFile(pid, file, ProjectDataService.libFolderName);
        if (!fs.existsSync(projectFile)) {
            return;
        }
        const projectFolder = this.getProjectFolder(pid);
        const targetFile = this.removeExt(projectFile, 'zip');
        new AdmZip(projectFile).extractAllTo(targetFile, true);
        if (!this._pJsFiles[pid]) {
            this._pJsFiles[pid] = {};
        }
        this._pJsFiles[pid][this.removeExt(file, 'zip')] = { name: this.removeExt(file, 'zip'), path: targetFile, createdDate: new Date(), size: 0 };
        fs.unlink(projectFile);
    }
    removeFile(type, pid, file) {
        const files = type === ProjectDataService.dataFolderName ? this._pDataFiles : this._pJsFiles;
        if (files[pid] && files[pid][file]) {
            Reflect.deleteProperty(files[pid], file);
            fs.removeSync(this.getProjectFile(pid, file, type));
        }
    }
    clearAll() {
        this.clearData(this._pJsFiles);
        this.clearData(this._gJsFiles);
        this.clearData(this._pDataFiles);
        this.clearData(this._gDataFiles);
    }
    clearData(data) {
        if (!data) {
            return;
        }
        Object.keys(data).forEach(k => {
            delete data[k];
        });
    }
    initFolderFiles(folder, isProject, isJs, pid) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, 0o666);
        }
        folder = this.getActualPath(folder, isJs ? ProjectDataService.libFolderName : ProjectDataService.dataFolderName);
        if (pid) {
            this._pJsFiles[pid] = this._pJsFiles[pid] || {};
            this._pDataFiles[pid] = this._pDataFiles[pid] || {};
        }
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(f => {
                const fileStat = fs.lstatSync(path.join(folder, f));
                if (isJs) {
                    if (fileStat.isDirectory) {
                        (isProject ? this._pJsFiles[pid] : this._gJsFiles)[f] = this.createFileData(folder, f, fileStat);
                    }
                    else if (fileStat.isFile && f.endsWith('.js')) {
                        const fileName = this.removeExt(f, 'js');
                        (isProject ? this._pJsFiles[pid] : this._gJsFiles)[fileName] = this.createFileData(folder, f, fileStat);
                    }
                }
                else if (fileStat.isFile) {
                    (isProject ? this._pDataFiles[pid] : this._gDataFiles)[f] = this.createFileData(folder, f, fileStat);
                }
            });
        }
        else {
            fs.mkdirSync(folder, 0o666);
        }
    }
    createFileData(folder, name, stat) {
        return { name, path: path.join(folder, name), createdDate: stat.ctime, size: stat.size };
    }
    initProjectFiles() {
        const projectFolders = fs.readdirSync(path.join(ProjectDataService.globalFolder, 'project')).filter(f => fs.lstatSync(path.join(ProjectDataService.globalFolder, 'project', f)).isDirectory && !this.isDataOrLibFolder(f));
        projectFolders.forEach(folder => {
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, 'project', folder), true, true, folder);
            this.initFolderFiles(path.join(ProjectDataService.globalFolder, 'project', folder), true, false, folder);
        });
    }
    isDataOrLibFolder(folder) {
        return folder === ProjectDataService.libFolderName || folder === ProjectDataService.dataFolderName;
    }
    initGlobalFiles() {
        this.initFolderFiles(ProjectDataService.globalFolder, false, true);
        this.initFolderFiles(ProjectDataService.globalFolder, false, false);
    }
    getActualPath(folder, type) {
        return path.join(folder, type);
    }
    removeExt(file, ext) {
        return file.endsWith(ext) ? file.substr(0, file.length - ext.length - 1) : file;
    }
    getProjectFolder(pid) {
        return path.join(ProjectDataService.globalFolder, `project/${pid}`);
    }
    getProjectFile(pid, file, type) {
        return path.join(ProjectDataService.globalFolder, `project/${pid}/${type}/${file}`);
    }
}
ProjectDataService.libFolderName = 'lib';
ProjectDataService.dataFolderName = 'data';
ProjectDataService.globalFolder = path.join(__dirname, `../global_data`);
ProjectDataService.instance = new ProjectDataService();
exports.ProjectDataService = ProjectDataService;
//# sourceMappingURL=project_data_service.js.map