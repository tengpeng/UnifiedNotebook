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
var services_1 = require("@jupyterlab/services");
var path = __importStar(require("path"));
var kernel_1 = require("./kernel");
var kernelspec_1 = require("./kernelspec");
var session_1 = require("./session");
var utils = __importStar(require("./utils"));
var consts_1 = require("./consts");
var express_1 = __importDefault(require("express"));
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
// session
var session;
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app, port;
    return __generator(this, function (_a) {
        app = express_1.default();
        port = 8080;
        app.use(express_1.default.json());
        // set new session
        app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init()];
                    case 1:
                        _a.sent();
                        res.end();
                        return [2 /*return*/];
                }
            });
        }); });
        // run cell
        app.post('/cell/run-cell', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var msgList, replyList, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        msgList = [];
                        replyList = [];
                        _a = session;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, kernel_1.executeCode(session, req.body.code, function (msg) {
                                msgList.push(msg);
                            }, function (reply) {
                                replyList.push(reply);
                            })];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _a;
                        res.send(JSON.stringify({ status: 'ok', data: { msgList: msgList, replyList: replyList } }));
                        return [2 /*return*/];
                }
            });
        }); });
        // shutdown session
        app.get('/session/shutdown', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                session && session_1.shutdown(session);
                res.end();
                return [2 /*return*/];
            });
        }); });
        app.listen(port, function () {
            console.log("API: http://localhost:" + port);
        });
        return [2 /*return*/];
    });
}); };
main();
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var kernelManager, sessionManager;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                kernelManager = new services_1.KernelManager();
                sessionManager = new services_1.SessionManager({ kernelManager: kernelManager });
                return [4 /*yield*/, kernelspec_1.getKernelSpecsList()];
            case 1:
                _a.sent();
                return [4 /*yield*/, session_1.startNew(options, sessionManager)];
            case 2:
                session = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=index.js.map