"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
require("reflect-metadata");
const KoaRouter = require("koa-router");
const Bodyparser = require("koa-bodyparser");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const KoaStatic = require("koa-static");
let app = new Koa();
const router = new KoaRouter();
router.get('/setup/env', (ctx, next) => {
    ctx.body = getPm2Obj().apps[0].env;
});
router.post('/setup/env', (ctx, next) => {
    const pm2Obj = getPm2Obj();
    pm2Obj.apps[0].env = ctx.request.body;
    pm2Obj.apps[0].script = 'index.js';
    fs.writeFileSync(getPm2File(), JSON.stringify(pm2Obj), 'utf8');
    try {
        child_process_1.execSync('pm2 -V', { encoding: 'utf8' });
    }
    catch (e) {
        child_process_1.execSync(`npm install pm2 -g`);
    }
    const stdout = child_process_1.execSync(`pm2 start ${getPm2File()}`, { encoding: 'utf8' });
    ctx.body = stdout;
});
app.use(KoaStatic(path.join(__dirname, 'public'), { gzip: true }))
    .use(Bodyparser())
    .use(router.routes())
    .use(router.allowedMethods());
app.listen(9527);
function getPm2File() {
    return path.join(__dirname, 'pm2.json');
}
function getPm2Obj() {
    const pm2Content = fs.readFileSync(getPm2File(), 'utf8');
    return JSON.parse(pm2Content);
}
//# sourceMappingURL=setup.js.map