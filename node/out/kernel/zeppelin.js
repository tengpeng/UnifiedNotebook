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
var node_fetch_1 = __importDefault(require("node-fetch"));
var bunyan_1 = require("bunyan");
var log = bunyan_1.createLogger({ name: 'Zeppelin' });
/* -------------------------------------------------------------------------- */
/*                              zeppelin rest api                             */
/* -------------------------------------------------------------------------- */
var Api;
(function (Api) {
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
    Api.runParagraph = function (noteId, paragraphId) {
        return '/api/notebook/run/' + noteId + '/' + paragraphId;
    };
})(Api || (Api = {}));
/* -------------------------------------------------------------------------- */
/*                           zeppelin fetch request                           */
/* -------------------------------------------------------------------------- */
var ZeppelinKernel = /** @class */ (function () {
    function ZeppelinKernel(server, port) {
        if (server === void 0) { server = process.env.ZEPPELIN_PROTOCOL + "://" + process.env.ZEPPELIN_HOST; }
        if (port === void 0) { port = process.env.ZEPPELIN_PORT; }
        this.noteId = '';
        this.server = server;
        this.port = port;
        this.url = this.server + ':' + this.port;
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
    ZeppelinKernel.prototype.init = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.deleteAllNote();
                        _b = this;
                        return [4 /*yield*/, this.createNote()];
                    case 1:
                        _b.noteId = (_a = _c.sent()) !== null && _a !== void 0 ? _a : '';
                        return [2 /*return*/, this];
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
    ZeppelinKernel.prototype.createParagraph = function (paragraphId, text) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendMsg('POST', this.url + Api.createParagraph(paragraphId), { title: '', text: text })];
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
    return ZeppelinKernel;
}());
exports.ZeppelinKernel = ZeppelinKernel;
//# sourceMappingURL=zeppelin.js.map