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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var utils = __importStar(require("../utils/notebook"));
var bunyan_1 = require("bunyan");
var services_1 = require("@jupyterlab/services");
var consts_1 = require("../consts");
var kernel_1 = require("./kernel");
var types_1 = require("common/lib/types");
var common_1 = require("../utils/common");
var log = bunyan_1.createLogger({ name: 'Kernel' });
var testNotebook = path.join(consts_1.NOTEBOOK_PATH, 'test1.ipynb');
var testKernelName = 'python';
var JupyterKernel = /** @class */ (function (_super) {
    __extends(JupyterKernel, _super);
    function JupyterKernel() {
        var _this = _super.call(this) || this;
        _this.sessionManager = new services_1.SessionManager({ kernelManager: new services_1.KernelManager() });
        _this.options = {
            path: testNotebook,
            type: utils.isNotebookFile(testNotebook) ? 'notebook' : '',
            name: utils.getFileName(testNotebook),
            kernel: {
                name: testKernelName
            }
        };
        return _this;
    }
    JupyterKernel.prototype.init = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.sessionManager.startNew(opts !== null && opts !== void 0 ? opts : this.options)];
                    case 1:
                        _a.session = _b.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    JupyterKernel.prototype.restart = function (onRestarted) {
        var _a, _b;
        var future = (_b = (_a = this.session) === null || _a === void 0 ? void 0 : _a.kernel) === null || _b === void 0 ? void 0 : _b.restart();
        future && future.then(function () {
            if (onRestarted)
                onRestarted();
        });
    };
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
        return {
            type: 'stream',
            name: msg.content.name,
            text: common_1.formatStreamText(common_1.concatMultilineStringOutput(msg.content.text))
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
    JupyterKernel.prototype.execute = function (code, onResults) {
        var _this = this;
        var _a, _b;
        var future = (_b = (_a = this.session) === null || _a === void 0 ? void 0 : _a.kernel) === null || _b === void 0 ? void 0 : _b.requestExecute({ code: code });
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
    };
    return JupyterKernel;
}(kernel_1.KernelBase));
exports.JupyterKernel = JupyterKernel;
//# sourceMappingURL=jupyter.js.map