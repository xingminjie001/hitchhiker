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
const session_service_1 = require("../services/session_service");
const message_1 = require("../common/message");
function sessionHandle() {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        const isSessionValid = yield session_service_1.SessionService.isSessionValid(ctx);
        if (!isSessionValid) {
            ctx.body = { success: false, message: message_1.Message.get('sessionInvalid') };
            ctx.status = 403;
            // ctx.redirect(Setting.instance.host);
            return;
        }
        session_service_1.SessionService.rollDate(ctx);
        return yield next();
    });
}
exports.default = sessionHandle;
//# sourceMappingURL=session_handle.js.map