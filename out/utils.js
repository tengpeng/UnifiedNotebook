"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
exports.isNotebookFile = function (pathStr) {
    return path.extname(pathStr) === '.ipynb' ? true : false;
};
exports.getFileName = function (pathStr) {
    return path.basename(pathStr);
};
//# sourceMappingURL=utils.js.map