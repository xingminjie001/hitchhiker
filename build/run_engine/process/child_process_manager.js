"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const log_1 = require("../../utils/log");
const _ = require("lodash");
const path = require("path");
const schedule_process_handler_1 = require("./schedule_process_handler");
const stress_process_handler_1 = require("./stress_process_handler");
const stress_nodejs_process_handler_1 = require("./stress_nodejs_process_handler");
const setting_1 = require("../../utils/setting");
class ChildProcessManager {
    constructor() {
        this.limit = 10;
        this.retryTimes = 0;
        this.autoRetry = true;
        this.processHandlerMapping = {};
        this.processConfigs = {
            ['schedule']: { entry: `${__dirname}/schedule_process.js`, count: 1, handlerCtor: schedule_process_handler_1.ScheduleProcessHandler },
            ['stress']: { entry: `${__dirname}/stress_process.js`, count: 1, handlerCtor: stress_process_handler_1.StressProcessHandler },
            ['stress_nodejs']: { entry: path.join(__dirname, 'stress_nodejs_process.js'), count: 1, handlerCtor: stress_nodejs_process_handler_1.StressNodejsProcessHandler }
        };
    }
    static create(key, info) {
        const manager = new ChildProcessManager();
        log_1.Log.info(`create process manager for ${info.entry}`);
        manager.processConfigs = {
            [key]: info
        };
        manager.autoRetry = false;
        return manager;
    }
    init() {
        this.processHandlerMapping = {};
        _.keys(this.processConfigs).forEach(c => _.times(this.processConfigs[c].count, n => this.createChildProcess(c)));
        process.on('exit', () => _.values(this.processHandlerMapping).forEach(p => {
            if (p instanceof Array) {
                p.forEach(cp => cp.process.kill());
            }
            else {
                p.process.kill();
            }
        }));
    }
    createChildProcess(moduleName) {
        if (moduleName === 'stress_nodejs' && setting_1.Setting.instance.stressType === 'none') {
            return;
        }
        const { handlerCtor, count, entry } = this.processConfigs[moduleName];
        const handler = new handlerCtor();
        if (count === 1) {
            this.processHandlerMapping[moduleName] = handler;
        }
        else {
            this.processHandlerMapping[moduleName] = this.processHandlerMapping[moduleName] || [];
            this.processHandlerMapping[moduleName].push(handler);
        }
        const process = childProcess.fork(entry, [], { silent: false, execArgv: [] });
        handler.process = process;
        process.on('message', msg => {
            handler.handleMessage(msg);
        });
        process.on('exit', (code, signal) => {
            if (!this.autoRetry) {
                log_1.Log.info(`${moduleName} process exit - code:${code}, signal:${signal}.`);
                return;
            }
            if (this.retryTimes === this.limit) {
                log_1.Log.error(`${moduleName} process exit ${this.limit} times, stop it.`);
                return;
            }
            log_1.Log.warn(`${moduleName} exit - code:${code}, signal:${signal}!`);
            this.retryTimes++;
            this.createChildProcess(moduleName);
        });
        handler.afterProcessCreated();
    }
    closeAll() {
        _.values(this.processHandlerMapping).forEach(p => {
            if (p instanceof Array) {
                p.forEach(cp => cp.process.kill());
            }
            else {
                p.process.kill();
            }
        });
    }
    getHandler(type) {
        return this.processHandlerMapping[type];
    }
}
ChildProcessManager.default = new ChildProcessManager();
exports.ChildProcessManager = ChildProcessManager;
//# sourceMappingURL=child_process_manager.js.map