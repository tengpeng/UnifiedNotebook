"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var log = bunyan_1.createLogger({ name: 'Kernel' });
var NBKernel = /** @class */ (function () {
    function NBKernel(session) {
        this.session = session;
        this.session.statusChanged.connect(function () { });
    }
    NBKernel.prototype.interrupt = function () {
        var _a;
        (_a = this.session.kernel) === null || _a === void 0 ? void 0 : _a.interrupt();
    };
    NBKernel.prototype.shutdown = function () {
        var _a;
        (_a = this.session.kernel) === null || _a === void 0 ? void 0 : _a.shutdown();
    };
    NBKernel.prototype.restart = function (onRestarted) {
        var _a;
        var future = (_a = this.session.kernel) === null || _a === void 0 ? void 0 : _a.restart();
        future && future.then(function () {
            if (onRestarted)
                onRestarted();
        });
    };
    NBKernel.prototype.execute = function (code, onResults) {
        var _a;
        var future = (_a = this.session.kernel) === null || _a === void 0 ? void 0 : _a.requestExecute({ code: code });
        if (future) {
            future.onIOPub = function (message) {
                log.info("WSKernel: execute:", message);
                onResults(message);
            };
            future.onReply = function (message) { return onResults(message); };
            future.onStdin = function (message) { return onResults(message); };
        }
    };
    NBKernel.prototype.destroy = function () {
        log.info("WSKernel: destroying jupyter-js-services Session");
        this.session.dispose();
    };
    return NBKernel;
}());
exports.NBKernel = NBKernel;
//# sourceMappingURL=kernel.js.map