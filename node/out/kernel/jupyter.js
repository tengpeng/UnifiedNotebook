"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var bunyan_1 = require("bunyan");
var services_1 = require("@jupyterlab/services");
var kernel_1 = require("./kernel");
var types_1 = require("common/lib/types");
var common_1 = require("../utils/common");
var cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
var log = bunyan_1.createLogger({ name: 'Kernel' });
var JupyterKernel = /** @class */ (function (_super) {
    __extends(JupyterKernel, _super);
    function JupyterKernel() {
        var _this = _super.call(this) || this;
        _this.name = 'Jupyter';
        return _this;
    }
    // kernel handler
    JupyterKernel.prototype.runningKernels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, services_1.KernelAPI.listRunning()];
            });
        });
    };
    JupyterKernel.prototype.shutdownKernel = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, services_1.KernelAPI.shutdownKernel(id)];
            });
        });
    };
    JupyterKernel.prototype.shutdownAllKernel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var kernels, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runningKernels()];
                    case 1:
                        kernels = _a.sent();
                        promises = kernels.map(function (kernel) { return _this.shutdownKernel(kernel.id); });
                        return [2 /*return*/, Promise.all(promises)];
                }
            });
        });
    };
    JupyterKernel.prototype.isKernelRunning = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var kernels, runningKernel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runningKernels()];
                    case 1:
                        kernels = _a.sent();
                        runningKernel = kernels.findIndex(function (kernel) { return kernel.name === name; });
                        return [2 /*return*/, runningKernel !== -1];
                }
            });
        });
    };
    JupyterKernel.prototype.getRunningKernel = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var kernels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runningKernels()];
                    case 1:
                        kernels = _a.sent();
                        return [2 /*return*/, kernels.find(function (kernel) { return kernel.name === name; })];
                }
            });
        });
    };
    JupyterKernel.prototype.startNewKernel = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, services_1.KernelAPI.startNew({ name: name })];
            });
        });
    };
    JupyterKernel.prototype.getKernelInfo = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.kernel) === null || _a === void 0 ? void 0 : _a.info];
            });
        });
    };
    JupyterKernel.prototype.startKernel = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var kernel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isKernelRunning(name)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getRunningKernel(name)];
                    case 2:
                        kernel = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.startNewKernel(name)];
                    case 4:
                        kernel = _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, kernel];
                }
            });
        });
    };
    JupyterKernel.prototype.connectToKernel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new services_1.KernelManager().connectTo({ model: model })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    JupyterKernel.prototype.switchToKernel = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var kernel, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.startKernel(name)];
                    case 1:
                        kernel = _b.sent();
                        if (!kernel) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.connectToKernel(kernel)];
                    case 2:
                        _a.kernel = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JupyterKernel.prototype.switchKernelIfNeeded = function (cell) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var currentKernel, currentKernelName, cellKernelName, info;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ((_a = this.kernel) === null || _a === void 0 ? void 0 : _a.info)];
                    case 1:
                        currentKernel = _b.sent();
                        currentKernelName = currentKernel === null || currentKernel === void 0 ? void 0 : currentKernel.language_info.name;
                        cellKernelName = cell.language;
                        if (!(currentKernelName !== cellKernelName)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.switchToKernel(cellKernelName)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.getKernelInfo()];
                    case 3:
                        info = _b.sent();
                        console.log("JupyterKernel -> execute -> switchToKernel", info === null || info === void 0 ? void 0 : info.language_info.name);
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    JupyterKernel.prototype.init = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this];
            });
        });
    };
    // result handler
    JupyterKernel.prototype.handleResult = function (msg) {
        try {
            // todo status message
            if (services_1.KernelMessage.isExecuteResultMsg(msg)) {
                return this.handleExecuteResult(msg);
            }
            else if (services_1.KernelMessage.isStreamMsg(msg)) {
                return this.handleStreamMesssage(msg);
            }
            else if (services_1.KernelMessage.isDisplayDataMsg(msg)) {
                return this.handleDisplayData(msg);
            }
            else if (services_1.KernelMessage.isClearOutputMsg(msg)) {
                return this.handleClearOutput(msg);
            }
            else if (services_1.KernelMessage.isStatusMsg(msg)) {
                return this.handleStatusMessage(msg);
            }
            else if (services_1.KernelMessage.isErrorMsg(msg)) {
                return this.handleError(msg);
            }
            else {
                log.warn("Unknown message " + msg.header.msg_type + " : hasData=" + ('data' in msg.content));
            }
        }
        catch (err) {
            log.error("JupyterMessage -> handleIOPub -> err", err);
        }
    };
    JupyterKernel.prototype.handleExecuteResult = function (msg) {
        return {
            type: "result",
            data: msg.content.data
        };
    };
    JupyterKernel.prototype.handleStreamMesssage = function (msg) {
        var serializedText = common_1.formatStreamText(common_1.concatMultilineStringOutput(msg.content.text));
        return {
            type: 'stream',
            name: msg.content.name,
            text: serializedText
        };
    };
    JupyterKernel.prototype.handleDisplayData = function (msg) {
        return {
            type: 'display',
            data: msg.content.data
        };
    };
    JupyterKernel.prototype.handleClearOutput = function (msg) {
        return {
            type: 'clear'
        };
    };
    JupyterKernel.prototype.handleError = function (msg) {
        // todo different from zeppelin
        return {
            type: 'error',
            ename: msg.content.ename,
            evalue: msg.content.evalue,
            traceback: msg.content.traceback
        };
    };
    JupyterKernel.prototype.handleStatusMessage = function (msg) {
        var state;
        if (msg.content.execution_state === 'idle') {
            state = types_1.ICellState.Finished;
        }
        else if (msg.content.execution_state === 'busy') {
            state = types_1.ICellState.Running;
        }
        else {
            state = types_1.ICellState.Error;
        }
        return {
            type: 'status',
            state: state
        };
    };
    // repl
    JupyterKernel.prototype.repl = function (payload, codeToExecute) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                        var tempCell, dataString;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.switchKernelIfNeeded(payload.cell)];
                                case 1:
                                    _a.sent();
                                    tempCell = cloneDeep_1.default(payload.cell);
                                    tempCell.source = codeToExecute;
                                    this.execute(tempCell, function (output) {
                                        if (types_1.isExecuteResultOutput(output)) {
                                            dataString = output.data['text/plain'];
                                        }
                                        if (types_1.isStreamOutput(output)) {
                                            dataString = output.text;
                                        }
                                        else {
                                            dataString = '';
                                        }
                                        // get text/plain data from the first output
                                        console.log("JupyterKernel -> constructor -> dataString", dataString);
                                        dataString && res(dataString);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    // execute
    JupyterKernel.prototype.execute = function (cell, onResults) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var future;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("JupyterKernel -> execute -> cell");
                        return [4 /*yield*/, this.switchKernelIfNeeded(cell)];
                    case 1:
                        _b.sent();
                        future = (_a = this.kernel) === null || _a === void 0 ? void 0 : _a.requestExecute({ code: cell.source });
                        if (future) {
                            future.onIOPub = function (message) {
                                var reply = _this.handleResult(message);
                                reply && onResults(reply);
                            };
                            // todo other message
                            // future.onReply = message => {
                            //     let reply = this.handleResult(message)
                            //     reply && onResults(reply)
                            // };
                            // future.onStdin = message => {
                            //     let reply = this.handleResult(message)
                            //     reply && onResults(reply)
                            // };
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // list all kernels
    JupyterKernel.prototype.kernels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var specs, kernels, _i, _a, val, _b, displayName, language, name_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, services_1.KernelSpecAPI.getSpecs()];
                    case 1:
                        specs = _c.sent();
                        if (specs && specs.kernelspecs) {
                            kernels = [];
                            for (_i = 0, _a = Object.values(specs.kernelspecs); _i < _a.length; _i++) {
                                val = _a[_i];
                                _b = val, displayName = _b.display_name, language = _b.language, name_1 = _b.name;
                                kernels.push({ displayName: displayName, language: language, name: name_1, backend: this.name });
                            }
                            return [2 /*return*/, kernels];
                        }
                        else {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // expose variable
    JupyterKernel.prototype.prepareCode = function (payload) {
        var language = payload.cell.language;
        var variable = payload.variable;
        var temp_variable = 'temp_unified_notebook_var';
        var code;
        if (language === 'python3') {
            code = "\n            import json\n            " + temp_variable + " = json.dumps(" + variable + ")\n            print(" + temp_variable + ")\n            del " + temp_variable + "\n            ";
        }
        else {
            // todo to support other language
            code = '';
        }
        return code;
    };
    JupyterKernel.prototype.expose = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var codeToExecute, output, exposeOutput;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeToExecute = this.prepareCode(payload);
                        return [4 /*yield*/, this.repl(payload, codeToExecute)];
                    case 1:
                        output = _a.sent();
                        exposeOutput = {
                            data: output
                        };
                        return [2 /*return*/, exposeOutput];
                }
            });
        });
    };
    return JupyterKernel;
}(kernel_1.KernelBase));
exports.JupyterKernel = JupyterKernel;
//# sourceMappingURL=jupyter.js.map