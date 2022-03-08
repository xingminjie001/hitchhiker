"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Compose = require("koa-compose");
const Bodyparser = require("koa-bodyparser");
const Session = require("koa-session-minimal");
const webapi_router_1 = require("webapi-router");
const session_handle_1 = require("./session_handle");
const session_service_1 = require("../services/session_service");
const route_failed_1 = require("./route_failed");
const error_handle_1 = require("./error_handle");
const KoaStatic = require("koa-static");
const Path = require("path");
const async_init_1 = require("./async_init");
const Compress = require("koa-compress");
function middleware(context) {
    const ctrlRouter = new webapi_router_1.WebApiRouter();
    return Compose([
        async_init_1.default(),
        error_handle_1.default(),
        KoaStatic(Path.join(__dirname, '../public'), { gzip: true }),
        Session({
            cookie: {
                maxAge: session_service_1.SessionService.maxAge
            }
        }),
        session_handle_1.default(),
        Compress(),
        Bodyparser({ jsonLimit: '50mb' }),
        ctrlRouter.router('../build/controllers', 'api'),
        route_failed_1.default(),
    ]);
}
exports.default = middleware;
//# sourceMappingURL=middleware.js.map