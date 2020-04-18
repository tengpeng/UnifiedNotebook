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
dotenv_1.default.config();
var jupyter;
// let zeppelin: IZeppelinKernel | undefined
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app, port, notebookSocket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                app = express_1.default();
                port = process.env.EXPRESS_PORT;
                return [4 /*yield*/, new jupyter_1.JupyterKernel().init()
                    // jupyter.execute('1+1', msg => { console.log(msg) })
                    // socketIO
                ];
            case 1:
                // init zeppelin and jupyter
                // zeppelin = await new ZeppelinKernel().init()
                jupyter = _a.sent();
                notebookSocket = new socket_1.NotebookSocket().createSocketServer(app, 80);
                console.log("main -> notebookSocket");
                if (notebookSocket.io) {
                    notebookSocket.io.on('connection', function (socket) {
                        socket.emit('socketID', socket.client.id);
                        socket.on('nb.ping', function () {
                            console.log("main -> ping");
                            socket.emit('nb.pong');
                        });
                        // restart kernel
                        // socket.on('session:restart', async () => {
                        //     console.log("TCL: main -> session:restart")
                        //     if (jupyter) {
                        //         jupyter.restart(() => {
                        //             socket.emit('session:restart:success')
                        //         })
                        //     }
                        // })
                        // run code
                        socket.on('cell.run', function (cell) {
                            jupyter === null || jupyter === void 0 ? void 0 : jupyter.execute(cell.source, function (msg) {
                                socket.emit('cell.run.ok', { msg: msg, cell: cell });
                            });
                        });
                        // socket.on('session:runcell:zeppelin', async (code) => {
                        //     console.log("main -> session:runcell:zeppelin")
                        //     if (zeppelin) {
                        //         let paragraphId = await zeppelin.createParagraph(zeppelin.noteId, code)
                        //         let res = await zeppelin.runParagraph(zeppelin.noteId, paragraphId)
                        //         socket.emit('session:runcell:zeppelin:success', res)
                        //     }
                        // })
                    });
                }
                // express middleware
                app.use(cors_1.default());
                app.use(express_1.default.json());
                app.listen(port, function () {
                    console.log("API: http://localhost:" + port);
                });
                return [2 /*return*/];
        }
    });
}); };
main();
//# sourceMappingURL=index.js.map