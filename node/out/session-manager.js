"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var services_1 = require("@jupyterlab/services");
var log = bunyan_1.createLogger({ name: 'SessionManager' });
var NBSessionManager = /** @class */ (function () {
    function NBSessionManager() {
        this.sessionManager = new services_1.SessionManager({ kernelManager: new services_1.KernelManager() });
    }
    /**
     * create a new session
     */
    NBSessionManager.prototype.startNewSession = function (options) {
        var _this = this;
        return this.sessionManager.startNew(options).then(function (session) {
            _this.session = session;
            log.info('new session started');
            return _this;
        }).catch(function (e) {
            log.error(e);
            return undefined;
        });
    };
    /**
     * shutdown a session
     */
    NBSessionManager.prototype.shutdown = function () {
        var _a;
        (_a = this.session) === null || _a === void 0 ? void 0 : _a.shutdown();
        log.info('session shutdown');
    };
    return NBSessionManager;
}());
exports.NBSessionManager = NBSessionManager;
//# sourceMappingURL=session-manager.js.map