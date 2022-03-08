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
const typeorm_1 = require("typeorm");
const log_1 = require("../utils/log");
const setting_1 = require("../utils/setting");
class ConnectionManager {
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ConnectionManager.isInitialize) {
                ConnectionManager.isInitialize = true;
                ConnectionManager.instance = yield typeorm_1.createConnection(ConnectionManager.connectionOptions);
            }
            while (ConnectionManager.instance === null) {
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            return typeorm_1.getConnection();
        });
    }
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ConnectionManager.getInstance();
        });
    }
}
ConnectionManager.instance = null;
ConnectionManager.isInitialize = false;
ConnectionManager.connectionOptions = Object.assign({}, setting_1.Setting.instance.db, { host: process.env.HITCHHIKER_DB_HOST || setting_1.Setting.instance.db.host, port: parseInt(process.env.HITCHHIKER_DB_PORT) || setting_1.Setting.instance.db.port, username: process.env.HITCHHIKER_DB_USERNAME || setting_1.Setting.instance.db.username, database: process.env.MYSQL_DATABASE || setting_1.Setting.instance.db.database, password: process.env.MYSQL_ROOT_PASSWORD || setting_1.Setting.instance.db.password, type: 'mysql', logging: {
        logger: (level, message) => log_1.Log[!log_1.Log[level] ? 'debug' : level](message),
        logQueries: true,
        logSchemaCreation: true,
        logFailedQueryError: true,
    }, autoSchemaSync: true, entities: [__dirname + '/../models/{*.ts,*.js}'] });
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection_manager.js.map