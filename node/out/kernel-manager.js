"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var services_1 = require("@jupyterlab/services");
var log = bunyan_1.createLogger({ name: 'KernelManager' });
var NBKernelManager = /** @class */ (function () {
    function NBKernelManager() {
        this.sessionManager = new services_1.SessionManager({ kernelManager: new services_1.KernelManager() });
    }
    /**
     * create a new session
     */
    NBKernelManager.prototype.startNewSession = function (options) {
        var _this = this;
        return this.sessionManager.startNew(options).then(function (session) {
            _this.session = session;
            log.info('new session started');
        }).catch(function (e) {
            log.error(e);
            return undefined;
        });
    };
    /**
     * shutdown a session
     */
    NBKernelManager.prototype.shutdown = function () {
        var _a;
        (_a = this.session) === null || _a === void 0 ? void 0 : _a.shutdown();
        log.info('session shutdown');
    };
    return NBKernelManager;
}());
exports.NBKernelManager = NBKernelManager;
//# sourceMappingURL=kernel-manager.js.map