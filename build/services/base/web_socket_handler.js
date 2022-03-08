"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../../utils/log");
class WebSocketHandler {
    constructor() {
        this.handle = (socket) => {
            this.socket = socket;
            this.init();
            socket.on('message', data => this.onReceive(data));
            socket.on('close', () => this.onClose());
        };
        this.send = (data) => {
            this.socket.send(data);
        };
        this.close = (data) => {
            this.socket.close(1000, data);
        };
    }
    init() {
        log_1.Log.info('ws init');
    }
}
exports.WebSocketHandler = WebSocketHandler;
//# sourceMappingURL=web_socket_handler.js.map