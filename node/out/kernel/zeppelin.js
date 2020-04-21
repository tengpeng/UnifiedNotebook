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
var node_fetch_1 = __importDefault(require("node-fetch"));
var bunyan_1 = require("bunyan");
var kernel_1 = require("./kernel");
var log = bunyan_1.createLogger({ name: 'Zeppelin' });
/* -------------------------------------------------------------------------- */
/*                              zeppelin rest api                             */
/* -------------------------------------------------------------------------- */
var Api;
(function (Api) {
    Api.listInterpreter = function () {
        return '/api/interpreter';
    };
    Api.listNote = function () {
        return '/api/notebook';
    };
    Api.createNote = function () {
        return '/api/notebook';
    };
    Api.deleteNote = function (noteId) {
        return '/api/notebook/' + noteId;
    };
    Api.createParagraph = function (noteId) {
        return '/api/notebook/' + noteId + '/paragraph';
    };
    Api.updateParagraph = function (noteId, paragraphId) {
        return '/api/notebook/' + noteId + '/paragraph/' + paragraphId;
    };
    Api.runParagraph = function (noteId, paragraphId) {
        return '/api/notebook/run/' + noteId + '/' + paragraphId;
    };
})(Api || (Api = {}));
/* -------------------------------------------------------------------------- */
/*                           zeppelin fetch request                           */
/* -------------------------------------------------------------------------- */
var ZeppelinKernel = /** @class */ (function (_super) {
    __extends(ZeppelinKernel, _super);
    function ZeppelinKernel(server, port) {
        if (server === void 0) { server = process.env.ZEPPELIN_PROTOCOL + "://" + process.env.ZEPPELIN_HOST; }
        if (port === void 0) { port = process.env.ZEPPELIN_PORT; }
        var _this = _super.call(this) || this;
        _this.name = 'Zeppelin';
        _this.noteId = '';
        _this.paragraphId = '';
        _this.server = server;
        _this.port = port;
        _this.url = _this.server + ':' + _this.port;
        return _this;
    }
    ZeppelinKernel.prototype.sendMsg = function (method, url, msg) {
        return __awaiter(this, void 0, void 0, function () {
            var opts;
            return __generator(this, function (_a) {
                if (method === 'GET')
                    return [2 /*return*/, node_fetch_1.default(url)];
                opts = { method: method, body: '' };
                if (!msg)
                    return [2 /*return*/, node_fetch_1.default(url, opts)];
                opts.body = JSON.stringify(msg);
                return [2 /*return*/, node_fetch_1.default(url, opts)];
            });
        });
    };
    ZeppelinKernel.prototype.handleResponse = function (res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (res === null || res === void 0 ? void 0 : res.json().catch(function (e) { return e && log.error(e); }))];
                    case 1:
                        json = _b.sent();
                        if (!(res === null || res === void 0 ? void 0 : res.ok))
                            log.error(json);
                        return [2 /*return*/, (_a = json.body) !== null && _a !== void 0 ? _a : ''];
                }
            });
        });
    };
    ZeppelinKernel.prototype.init = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.deleteAllNote();
                        _b = this;
                        return [4 /*yield*/, this.createNote()];
                    case 1:
                        _b.noteId = (_a = _d.sent()) !== null && _a !== void 0 ? _a : '';
                        _c = this;
                        return [4 /*yield*/, this.createParagraph(this.noteId, '')];
                    case 2:
                        _c.paragraphId = _d.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    ZeppelinKernel.prototype.listInterpreter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('GET', this.url + Api.listInterpreter())];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, this.handleResponse(res)];
                }
            });
        });
    };
    ZeppelinKernel.prototype.createNote = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('POST', this.url + Api.createNote(), { name: name !== null && name !== void 0 ? name : '' })];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, this.handleResponse(res)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ZeppelinKernel.prototype.listNote = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('GET', this.url + Api.listNote())];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, this.handleResponse(res)];
                }
            });
        });
    };
    ZeppelinKernel.prototype.deleteAllNote = function () {
        return __awaiter(this, void 0, void 0, function () {
            var noteList;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listNote()];
                    case 1:
                        noteList = _a.sent();
                        noteList.forEach(function (note) {
                            _this.deleteNote(note.id);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ZeppelinKernel.prototype.deleteNote = function (noteId) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('DELETE', this.url + Api.deleteNote(noteId))];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, this.handleResponse(res)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ZeppelinKernel.prototype.createParagraph = function (noteId, text) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('POST', this.url + Api.createParagraph(noteId), { title: '', text: text })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, this.handleResponse(res)];
                }
            });
        });
    };
    ZeppelinKernel.prototype.updateParagraph = function (noteId, paragraphId, text) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('PUT', this.url + Api.updateParagraph(noteId, paragraphId), { title: '', text: text })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, this.handleResponse(res)];
                }
            });
        });
    };
    ZeppelinKernel.prototype.runParagraph = function (noteId, paragraphId) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('POST', this.url + Api.runParagraph(noteId, paragraphId))];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, this.handleResponse(res)];
                }
            });
        });
    };
    ZeppelinKernel.prototype.isSuccessMsg = function (msg) {
        return msg.code === 'SUCCESS';
    };
    ZeppelinKernel.prototype.isErrorMsg = function (msg) {
        return msg.code === 'ERROR';
    };
    ZeppelinKernel.prototype.isTextData = function (data) {
        return data.type === 'TEXT';
    };
    ZeppelinKernel.prototype.isHTMLData = function (data) {
        return data.type === 'HTML';
    };
    ZeppelinKernel.prototype.handleMIME = function (result) {
        if (this.isTextData(result)) {
            return {
                type: 'text/plain',
                data: result.data
            };
        }
        else if (this.isHTMLData(result)) {
            return {
                type: 'text/html',
                data: result.data
            };
        }
        else {
            return {
                type: 'unknown',
                data: result.data
            };
        }
    };
    ZeppelinKernel.prototype.handleResultData = function (msg, success) {
        var _this = this;
        // success: if message code is 'SUCCESS'
        var results = msg.msg;
        var dataMap = {};
        var dataList = results.map(function (result) {
            return _this.handleMIME(result);
        });
        dataList.forEach(function (data) {
            if (data.type in dataMap) {
                dataMap[data.type] += "\n" + data.data;
            }
            else {
                dataMap[data.type] = data.data;
            }
        });
        var executeResultOutput = {
            type: 'result',
            data: dataMap
        };
        return executeResultOutput;
    };
    ZeppelinKernel.prototype.handleResult = function (msg) {
        if (this.isSuccessMsg(msg)) {
            return this.handleResultData(msg, true);
        }
        else if (this.isErrorMsg(msg)) {
            return this.handleResultData(msg, false);
        }
        else {
            log.warn("Unknown message " + msg.code);
            return undefined;
        }
    };
    ZeppelinKernel.prototype.kernels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var interpreters, kernels, _i, _a, val, _b, displayName, language, name_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.listInterpreter()];
                    case 1:
                        interpreters = _c.sent();
                        kernels = [];
                        for (_i = 0, _a = Object.values(interpreters); _i < _a.length; _i++) {
                            val = _a[_i];
                            _b = val, displayName = _b.name, language = _b.id, name_1 = _b.id;
                            kernels.push({ displayName: displayName, language: language, name: name_1, backend: this.name });
                        }
                        return [2 /*return*/, kernels];
                }
            });
        });
    };
    ZeppelinKernel.prototype.runningKernels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ZeppelinKernel.prototype.shutdownAllKernel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ZeppelinKernel.prototype.execute = function (cell, onResults) {
        return __awaiter(this, void 0, void 0, function () {
            var source, res, reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        source = cell.source;
                        source = "%" + cell.language + "\n" + source;
                        return [4 /*yield*/, this.updateParagraph(this.noteId, this.paragraphId, source)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runParagraph(this.noteId, this.paragraphId)];
                    case 2:
                        res = _a.sent();
                        console.log("execute -> res", res);
                        if (res) {
                            reply = this.handleResult(res);
                            reply && onResults(reply);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return ZeppelinKernel;
}(kernel_1.KernelBase));
exports.ZeppelinKernel = ZeppelinKernel;
//# sourceMappingURL=zeppelin.js.map