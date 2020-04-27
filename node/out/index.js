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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
var socket_1 = require("./socket");
var jupyter_1 = require("./kernel/jupyter");
var backend_1 = require("./backend");
var bunyan_1 = require("bunyan");
var notebook_1 = require("./notebook");
var log = bunyan_1.createLogger({ name: 'Main' });
dotenv_1.default.config();
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app, port, backendManager, _a, _b, notebookManager, exposedVarMap, updateExposeMap, createExposedVarMapValue, getExposedVarMapValueWithOutJsonData, clearExposeMap, notebookSocket;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                app = express_1.default();
                port = process.env.EXPRESS_PORT;
                backendManager = new backend_1.BackendManager();
                _b = (_a = backendManager).register;
                return [4 /*yield*/, new jupyter_1.JupyterKernel().init()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                notebookManager = new notebook_1.NotebookManager(backendManager);
                exposedVarMap = {};
                updateExposeMap = function (store) {
                    exposedVarMap[store.id] = store;
                };
                createExposedVarMapValue = function (exposeVarOutput, exposeVarPayload) {
                    var store = {
                        id: exposeVarPayload.exposeCell.id,
                        payload: exposeVarPayload,
                        jsonData: exposeVarOutput
                    };
                    updateExposeMap(store);
                    return store;
                };
                getExposedVarMapValueWithOutJsonData = function (exposedVarMapValue) {
                    var id = exposedVarMapValue.id, payload = exposedVarMapValue.payload;
                    return { id: id, payload: payload };
                };
                clearExposeMap = function () {
                    log.info('clear exposeMap cache');
                    exposedVarMap = {};
                };
                notebookSocket = new socket_1.NotebookSocket().createSocketServer(app, 80);
                if (notebookSocket.io) {
                    notebookSocket.io.on('connection', function (socket) {
                        log.info('socket connection success');
                        socket.emit('socketID', socket.client.id);
                        socket.on('nb.ping', function () {
                            socket.emit('nb.pong');
                        });
                        socket.on('kernel.list', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var kernels;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, backendManager.kernels()];
                                    case 1:
                                        kernels = _a.sent();
                                        socket.emit('kernel.list.ok', kernels);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        socket.on('kernel.shutdown.all', function () {
                            backendManager.getBackend('Jupyter').shutdownAllKernel();
                        });
                        socket.on('kernel.running.list', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var kernels;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, backendManager.getBackend('Jupyter').runningKernels()];
                                    case 1:
                                        kernels = _a.sent();
                                        socket.emit('kernel.running.list.ok', kernels);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        // run code
                        socket.on('cell.run', function (cell) { return __awaiter(void 0, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, backendManager.execute(cell, function (msg) {
                                                socket.emit('cell.run.ok', { msg: msg, cell: cell });
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_1 = _a.sent();
                                        log.error(error_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        socket.on('cell.interrupt', function (cell) { return __awaiter(void 0, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, backendManager.interrupt(cell)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _a.sent();
                                        log.error(error_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        // run notebook
                        socket.on('notebook.run', function (notebook) { return __awaiter(void 0, void 0, void 0, function () {
                            var error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, notebookManager.loadNotebookJSON(notebook)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, notebookManager.runNotebook(function (payload) {
                                                if (payload.finish) {
                                                    socket.emit('notebook.run.ok', payload);
                                                }
                                                else {
                                                    socket.emit('notebook.run.progress', payload);
                                                }
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_3 = _a.sent();
                                        log.error(error_3);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        // expose
                        socket.on('expose.variable', function (exposeVarPayload) { return __awaiter(void 0, void 0, void 0, function () {
                            var exposeVarOutput, exposedVarMapValue, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, backendManager.exposeVar(exposeVarPayload)];
                                    case 1:
                                        exposeVarOutput = _a.sent();
                                        exposedVarMapValue = getExposedVarMapValueWithOutJsonData(createExposedVarMapValue(exposeVarOutput, exposeVarPayload));
                                        socket.emit('expose.variable.ok', exposedVarMapValue);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_4 = _a.sent();
                                        log.error(error_4);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        socket.on('expose.variable.list', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _exposedVarMap, _i, _a, _b, id, val;
                            return __generator(this, function (_c) {
                                _exposedVarMap = {};
                                for (_i = 0, _a = Object.entries(exposedVarMap); _i < _a.length; _i++) {
                                    _b = _a[_i], id = _b[0], val = _b[1];
                                    _exposedVarMap[id] = getExposedVarMapValueWithOutJsonData(val);
                                }
                                socket.emit('expose.variable.list.ok', _exposedVarMap);
                                return [2 /*return*/];
                            });
                        }); });
                        socket.on('expose.variable.import', function (exposedVarMapValue) { return __awaiter(void 0, void 0, void 0, function () {
                            var _exposedVarMapValue, bool, error_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        log.info('import variable exposedVarMapValue');
                                        _exposedVarMapValue = exposedVarMap[exposedVarMapValue.payload.exposeCell.id];
                                        // merge payload
                                        _exposedVarMapValue.payload.importCell = exposedVarMapValue.payload.importCell;
                                        _exposedVarMapValue.payload.importVarRename = exposedVarMapValue.payload.importVarRename;
                                        return [4 /*yield*/, backendManager.importVar(_exposedVarMapValue)];
                                    case 1:
                                        bool = _a.sent();
                                        log.info('import variable finish: ', bool);
                                        socket.emit('expose.variable.import.ok', bool);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_5 = _a.sent();
                                        log.error(error_5);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    notebookSocket.io.on('connect', function () {
                        // clearExposeMap()
                    });
                }
                // express middleware
                app.use(cors_1.default());
                app.use(express_1.default.json());
                app.listen(port, function () {
                    log.info("API: http://localhost:" + port);
                });
                return [2 /*return*/];
        }
    });
}); };
main();
//# sourceMappingURL=index.js.map