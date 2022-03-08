"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleMessage {
    constructor() {
        this.msgs = [];
    }
    get messages() {
        return this.msgs;
    }
    static create(valid) {
        var cm = new ConsoleMessage();
        cm.valid = valid;
        return cm;
    }
    push(message, type = 'info', force) {
        if (force || this.valid) {
            this.msgs.push({ time: new Date(), message, type, custom: false });
        }
    }
    pushArray(msgs, isCustom, force) {
        if (force || this.valid) {
            this.msgs.push(...msgs);
        }
    }
}
exports.ConsoleMessage = ConsoleMessage;
//# sourceMappingURL=console_message.js.map