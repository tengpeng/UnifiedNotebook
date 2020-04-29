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
function isStatusOutput(msg) {
    return msg.type === 'status';
}
exports.isStatusOutput = isStatusOutput;
function isStreamOutput(msg) {
    return msg.type === 'stream';
}
exports.isStreamOutput = isStreamOutput;
function isErrorOutput(msg) {
    return msg.type === 'error';
}
exports.isErrorOutput = isErrorOutput;
function isClearOutput(msg) {
    return msg.type === 'clear';
}
exports.isClearOutput = isClearOutput;
function isParameterCell(cell) {
    return cell.type === CellType.PARAMETER;
}
exports.isParameterCell = isParameterCell;
