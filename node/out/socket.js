"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var socket_io_1 = __importDefault(require("socket.io"));
var bunyan_1 = require("bunyan");
var log = bunyan_1.createLogger({ name: 'Socket' });
var NBSocket = /** @class */ (function () {
    function NBSocket() {
    }
    /**
     * create nodejs http server
     */
    NBSocket.prototype.createSocketServer = function (app, port) {
        this.server = http_1.createServer(app);
        this.io = socket_io_1.default.listen(this.server);
        this.server.listen(port);
        this.io.on('connection', this._onConnection);
        return this;
    };
    NBSocket.prototype._onConnection = function (socket) {
        log.info('socket connected');
        this.socket = socket;
    };
    return NBSocket;
}());
exports.NBSocket = NBSocket;
//# sourceMappingURL=socket.js.map