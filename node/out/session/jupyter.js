"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var services_1 = require("@jupyterlab/services");
var log = bunyan_1.createLogger({ name: 'JupyterSession' });
var JupyterSession = /** @class */ (function () {
    function JupyterSession() {
        this.sessionManager = new services_1.SessionManager({ kernelManager: new services_1.KernelManager() });
    }
    /**
     * create a new session
     */
    JupyterSession.prototype.startNewSession = function (options) {
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
    return JupyterSession;
}());
exports.JupyterSession = JupyterSession;
//# sourceMappingURL=jupyter.js.map