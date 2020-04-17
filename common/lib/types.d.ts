export interface INotebookViewModel {
    notebook: INotebook;
}
export interface ICellViewModel {
    cell: ICell;
}
export interface INotebook {
    cells: ICellViewModel[];
}
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
export declare type ICell = ICodeCell;
export declare enum ICellState {
    "Running" = 1,
    "Finished" = 2,
    "Error" = 3
}
export interface ICellMetadata {
    scrollbar: boolean;
    source_hidden: boolean;
    output_hidden: boolean;
}
export declare enum CellType {
    CODE = "code",
    MARKDOWN = "markdown",
    PARAMETER = "parameter"
}
export interface ICodeCell extends ICellBase {
    language: string;
}
export interface ICellOutput {
    type: ICellOutputType;
}
export declare type ICellOutputType = "stream" | "display" | "result" | "error";
export interface IMimeBundle {
    [key: string]: string;
}
export interface IStreamOutput extends ICellOutput {
    type: "stream";
    name: "stdout" | "stderr";
    text: string;
}
export interface IDiaplayOutput extends ICellOutput {
    type: "display";
    data: IMimeBundle;
}
export interface IExecuteResultOutput extends ICellOutput {
    type: "result";
    data: IMimeBundle;
}
export interface IError extends ICellOutput {
    type: "error";
    ename: string;
    evalue: string;
    traceback: any;
}
