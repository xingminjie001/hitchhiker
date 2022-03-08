"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noEnvironment = 'No environment';
var WorkerStatus;
(function (WorkerStatus) {
    WorkerStatus[WorkerStatus["idle"] = 0] = "idle";
    WorkerStatus[WorkerStatus["ready"] = 1] = "ready";
    WorkerStatus[WorkerStatus["working"] = 2] = "working";
    WorkerStatus[WorkerStatus["finish"] = 3] = "finish";
    WorkerStatus[WorkerStatus["down"] = 4] = "down";
    WorkerStatus[WorkerStatus["fileReady"] = 5] = "fileReady";
})(WorkerStatus = exports.WorkerStatus || (exports.WorkerStatus = {}));
var StressMessageType;
(function (StressMessageType) {
    StressMessageType[StressMessageType["hardware"] = 0] = "hardware";
    StressMessageType[StressMessageType["task"] = 1] = "task";
    StressMessageType[StressMessageType["start"] = 2] = "start";
    StressMessageType[StressMessageType["runResult"] = 3] = "runResult";
    StressMessageType[StressMessageType["stop"] = 4] = "stop";
    StressMessageType[StressMessageType["status"] = 5] = "status";
    StressMessageType[StressMessageType["fileStart"] = 6] = "fileStart";
    StressMessageType[StressMessageType["fileFinish"] = 7] = "fileFinish";
    StressMessageType[StressMessageType["init"] = 8] = "init";
    StressMessageType[StressMessageType["close"] = 9] = "close";
    StressMessageType[StressMessageType["wait"] = 10] = "wait";
    StressMessageType[StressMessageType["error"] = 11] = "error";
    StressMessageType[StressMessageType["finish"] = 12] = "finish";
    StressMessageType[StressMessageType["noWorker"] = 13] = "noWorker";
})(StressMessageType = exports.StressMessageType || (exports.StressMessageType = {}));
// type StressFaildType = 'noRes' | 'm500' | 'testFailed' | 'timeout';
class StressFailedType {
}
StressFailedType.noRes = 'noRes';
StressFailedType.m500 = 'm500';
StressFailedType.testFailed = 'testFailed';
exports.StressFailedType = StressFailedType;
//# sourceMappingURL=stress_type.js.map