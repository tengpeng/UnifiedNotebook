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
exports.shutdown = function (session, type) {
    if (type === void 0) { type = 0; }
    session.shutdown();
    process.exit(type);
};
//# sourceMappingURL=session.js.map