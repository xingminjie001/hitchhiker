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
const ts = require("typescript");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const log_1 = require("./log");
class ScriptTransform {
    static toES5(source) {
        const result = ts.transpileModule(source, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES5
            }
        });
        return result.outputText;
    }
    static zipAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const zipPath = path.join(__dirname, '../global_data');
            const zipFile = `${zipPath}.zip`;
            if (fs.existsSync(zipFile)) {
                fs.unlinkSync(zipFile);
            }
            const output = fs.createWriteStream(zipFile);
            const archive = archiver('zip');
            let isClose = false;
            archive.on('error', (err) => {
                log_1.Log.error(`zip global data error: ${err.message}`);
            });
            output.on('close', () => { isClose = true; });
            output.on('end', () => { isClose = true; });
            archive.pipe(output);
            archive.directory(zipPath, false);
            // const folders = fs.readdirSync(zipPath);
            // folders.forEach(f => {
            //     if (fs.statSync(path.join(zipPath, f)).isDirectory) {
            //         archive.directory(path.join(zipPath, f), f);
            //     }
            // });
            yield archive.finalize();
            while (!isClose) {
                yield new Promise((resolve, reject) => {
                    setTimeout(resolve, 100);
                });
            }
            return fs.readFileSync(zipFile);
        });
    }
}
exports.ScriptTransform = ScriptTransform;
//# sourceMappingURL=script_transform.js.map