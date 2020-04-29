/* -------------------------------------------------------------------------- */
/*                                  react vm                                  */
/* -------------------------------------------------------------------------- */
// notebook vm in react
export interface INotebookViewModel {
    notebook: INotebook
}
// cell vm in react
export interface ICellViewModel {
    cell: ICell;
    exposed: string
}

/* -------------------------------------------------------------------------- */
/*                                  notebook                                  */
/* -------------------------------------------------------------------------- */
// notebook
export interface INotebook {
    cells: ICellViewModel[]
}
// notebook json data
export interface INotebookJSON {
    cells: ICell[]
}
// run notebook callback
export interface INotebookCallback {
    (payload: INotebookCallbackPayload): void
}
// run notebook callback payload
export interface INotebookCallbackPayload {
    current: number;
    length: number;
    finish: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                    cell                                    */
/* -------------------------------------------------------------------------- */
/**
 * id: cell uuid
 * type: code/markdown/parameter
 * source: user input value
 * metadata: define show/hide source/output and scrollbar in output
 * outputs: cell output list containing mime bundle data object
 * state: cell current state running/finished/error
 */
export interface ICellBase {
    id: string;
    type: CellType;
    source: string;
    metadata: ICellMetadata;
    outputs: ICellOutput[];
    state: ICellState;
}

export type ICell = ICodeCell

// cell state
export enum ICellState {
    "Running" = 1,
    "Finished",
    "Error",
}

// cell metadata
export interface ICellMetadata {
    scrollbar: boolean;
    source_hidden: boolean;
    output_hidden: boolean;
}
// celltype
export enum CellType {
    CODE = 'code',
    MARKDOWN = 'markdown',
    PARAMETER = 'parameter'
};

// code cell
export interface ICodeCell extends ICellBase {
    language: string;
    backend: string;
}

// code cell output
export interface IMimeBundle {
    [key: string]: string // text/plain text/html ...
}

export interface ICellOutput {
    type: ICellOutputType;
}

export type ICellOutputType = "stream" | "display" | "result" | "error" | "clear" | "status"; // zeppelin TEXT HTML IMAGE TABLE can be mimetype

export interface IStreamOutput extends ICellOutput {
    type: "stream";
    name: "stdout" | "stderr";
    text: string;
}

export interface IDiaplayOutput extends ICellOutput {
    type: "display";
    data: IMimeBundle;
}

export interface IClearOutput extends ICellOutput {
    type: "clear";
}

export interface IExecuteResultOutput extends ICellOutput {
    type: "result";
    data: IMimeBundle;
}

export interface IStatusOutput extends ICellOutput {
    type: "status";
    state: ICellState
}

export interface IErrorOutput extends ICellOutput {
    type: "error";
    ename: string;
    evalue: string;
    traceback: any; // todo
}

export function isExecuteResultOutput(msg: ICellOutput) {
    return msg.type === 'result'
}

export function isStatusOutput(msg: ICellOutput) {
    return msg.type === 'status'
}

export function isStreamOutput(msg: ICellOutput) {
    return msg.type === 'stream'
}

export function isErrorOutput(msg: ICellOutput) {
    return msg.type === 'error'
}

export function isClearOutput(msg: ICellOutput) {
    return msg.type === 'clear'
}

export function isParameterCell(cell: ICodeCell) {
    return cell.type === CellType.PARAMETER
}

// socket response
export interface IResponse {
    msg: ICellOutput
    cell: ICell
}

/* -------------------------------------------------------------------------- */
/*                                   Kernel                                   */
/* -------------------------------------------------------------------------- */
export interface IKernelSpec {
    language: string,
    name: string,
    displayName: string,
    backend: string
}
export type IKernelSpecs = IKernelSpec[]

/* -------------------------------------------------------------------------- */
/*                                  ExposeVar                                 */
/* -------------------------------------------------------------------------- */
export interface IExposeVarPayload {
    exposeVar: string;
    exposeCell: ICodeCell;
    importVarRename?: string;
    importCell?: ICodeCell;
}
export type IExposeVarOutput = string;
export interface IExposedVarMap {
    [key: string]: IExposedVarMapValue
}
export interface IExposedVarMapValue {
    id: string;
    payload: IExposeVarPayload;
    jsonData?: IExposeVarOutput;
}
