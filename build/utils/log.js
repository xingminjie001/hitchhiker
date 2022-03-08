"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log4js = require("log4js");
const log4js_1 = require("log4js");
const Path = require("path");
class Log {
    static init() {
        Log4js.configure(Path.join(__dirname, '../../logconfig.json'));
        Log.logger = log4js_1.getLogger('default');
        Log.logger.setLevel(Log4js.levels.DEBUG);
    }
    static info(info) {
        Log.logger.info(info);
    }
    static debug(debug) {
        Log.logger.debug(debug);
    }
    static warn(warn) {
        Log.logger.warn(warn);
    }
    static error(error) {
        Log.logger.error(error);
    }
}
exports.Log = Log;
//# sourceMappingURL=log.js.map