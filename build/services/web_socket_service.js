"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WS = require("ws");
const schedule_on_demand_service_1 = require("./schedule_on_demand_service");
const stress_test_ws_service_1 = require("./stress_test_ws_service");
class WebSocketService {
    constructor(server) {
        this.routes = {};
        this.wsServer = new WS.Server({ server });
        this.use('/schedule', schedule_on_demand_service_1.ScheduleOnDemandService);
        this.use('/stresstest', stress_test_ws_service_1.StressTestWSService);
    }
    use(path, handler) {
        this.routes[path] = handler;
    }
    start() {
        this.wsServer.on('connection', (socket, req) => {
            const route = this.routes[req.url];
            if (!route) {
                socket.close(1000, `no handler for ${req.url}`);
                return;
            }
            new route().handle(socket);
        });
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=web_socket_service.js.map