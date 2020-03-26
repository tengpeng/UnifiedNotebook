"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var log = bunyan_1.createLogger({ name: 'session' });
exports.startNew = function (options, sessionManager) {
    return sessionManager.startNew(options).catch(function (e) {
        log.error(e);
        return undefined;
    });
};
exports.shutdown = function (session) {
    session.shutdown();
};
//# sourceMappingURL=session.js.map