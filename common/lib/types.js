"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cell state
var ICellState;
(function (ICellState) {
    ICellState[ICellState["Running"] = 1] = "Running";
    ICellState[ICellState["Finished"] = 2] = "Finished";
    ICellState[ICellState["Error"] = 3] = "Error";
})(ICellState = exports.ICellState || (exports.ICellState = {}));
// celltype
var CellType;
(function (CellType) {
    CellType["CODE"] = "code";
    CellType["MARKDOWN"] = "markdown";
    CellType["PARAMETER"] = "parameter";
})(CellType = exports.CellType || (exports.CellType = {}));
;
function isExecuteResultOutput(msg) {
    return msg.type === 'result';
}
exports.isExecuteResultOutput = isExecuteResultOutput;
