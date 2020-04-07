"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var utils = __importStar(require("./utils"));
var consts_1 = require("./consts");
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var socket_1 = require("./socket");
var session_manager_1 = require("./session-manager");
var kernel_1 = require("./kernel");
var testNotebook = path.join(consts_1.NOTEBOOK_PATH, 'test1.ipynb');
var testKernelName = 'python';
var testCode = '1 + 1';
// options
var options = {
    path: testNotebook,
    type: utils.isNotebookFile(testNotebook) ? 'notebook' : '',
    name: utils.getFileName(testNotebook),
    kernel: {
        name: testKernelName
    }
};
// sessionManager
var sessionManager;
var kernel;
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app, port, nbSocket;
    var _a;
    return __generator(this, function (_b) {
        app = express_1.default();
        port = 8888;
        nbSocket = new socket_1.NBSocket().createSocketServer(app, 80);
        (_a = nbSocket.io) === null || _a === void 0 ? void 0 : _a.on('connection', function (socket) {
            socket.emit('socketID', socket.client.id);
            // start session
            socket.on('session:start', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("TCL: main -> session:start");
                            return [4 /*yield*/, new session_manager_1.NBSessionManager().startNewSession(options)];
                        case 1:
                            sessionManager = _a.sent();
                            socket.emit('session:start:success');
                            if (sessionManager === null || sessionManager === void 0 ? void 0 : sessionManager.session) {
                                kernel = new kernel_1.NBKernel(sessionManager.session);
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            // restart kernel
            socket.on('session:restart', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log("TCL: main -> session:restart");
                    if (kernel) {
                        kernel.restart(function () {
                            socket.emit('session:restart:success');
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // run code
            socket.on('session:runcell', function (code) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log("TCL: main -> session:runcell");
                    kernel === null || kernel === void 0 ? void 0 : kernel.execute(code, function (msg) {
                        socket.emit('session:runcell:success', msg);
                    });
                    return [2 /*return*/];
                });
            }); });
        });
        // express middleware
        app.use(cors_1.default());
        app.use(express_1.default.json());
        app.listen(port, function () {
            console.log("API: http://localhost:" + port);
        });
        return [2 /*return*/];
    });
}); };
main();
//# sourceMappingURL=index.js.map