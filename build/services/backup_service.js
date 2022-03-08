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
const mysqlDump = require("mysqldump");
const path = require("path");
const fs = require("fs-extra");
const setting_1 = require("../utils/setting");
const log_1 = require("../utils/log");
class BackupService {
    static backupDB() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isBackuping) {
                log_1.Log.info('is backuping');
                return;
            }
            log_1.Log.info('try to backup db');
            if (new Date().getHours() !== this.backupHour) {
                log_1.Log.info('not the backup time');
                return;
            }
            const files = fs.readdirSync(this.backupFolder);
            const isBackuped = files.some(f => fs.statSync(path.join(this.backupFolder, f)).birthtime.toLocaleDateString() === new Date().toLocaleDateString());
            if (isBackuped) {
                log_1.Log.info('db was backuped today');
                return;
            }
            this.isBackuping = true;
            try {
                if (!fs.existsSync(this.backupFolder)) {
                    fs.mkdirSync(this.backupFolder, 0o666);
                }
                if (files.length >= this.backupMaxCount) {
                    let oldFile = path.join(this.backupFolder, files[0]);
                    let oldFileDate = fs.statSync(oldFile).birthtime;
                    for (let i = 1; i < files.length; i++) {
                        const newFile = path.join(this.backupFolder, files[i]);
                        const newFileDate = fs.statSync(newFile).birthtime;
                        if (newFileDate > fs.statSync(oldFile).birthtime) {
                            oldFile = newFile;
                            oldFileDate = newFileDate;
                        }
                    }
                    fs.unlinkSync(oldFile);
                }
                log_1.Log.info('dump mysql');
                yield this.dump(new Date().toLocaleDateString());
                log_1.Log.info('backup completely');
            }
            catch (ex) {
                log_1.Log.error(ex);
            }
            finally {
                this.isBackuping = false;
            }
        });
    }
    static dump(name) {
        return new Promise((resolve, reject) => {
            mysqlDump({
                host: process.env.HITCHHIKER_DB_HOST || setting_1.Setting.instance.db.host,
                port: parseInt(process.env.HITCHHIKER_DB_PORT) || setting_1.Setting.instance.db.port,
                user: process.env.HITCHHIKER_DB_USERNAME || setting_1.Setting.instance.db.username,
                password: process.env.MYSQL_ROOT_PASSWORD || setting_1.Setting.instance.db.password,
                database: process.env.MYSQL_DATABASE || setting_1.Setting.instance.db.database,
                dest: path.join(this.backupFolder, name)
            }, function (err) {
                if (err) {
                    log_1.Log.error('dump mysql failed');
                    log_1.Log.error(err.toString());
                    reject(err);
                }
                else {
                    log_1.Log.info('dump mysql success');
                    resolve();
                }
            });
        });
    }
}
BackupService.isBackuping = false;
BackupService.backupHour = 23;
BackupService.backupMaxCount = 10;
BackupService.backupFolder = path.join(__dirname, '../backup');
exports.BackupService = BackupService;
//# sourceMappingURL=backup_service.js.map