import * as nbformat from '@jupyterlab/nbformat'

export enum NotebookType {
    Jupyter = 1,
    Zeppelin
}

export enum CellState {
    editing = -1,
    init = 0,
    executing = 1,
    finished = 2,
    error = 3
}

export interface ICell {
    id: string;
    file: string;
    line: number;
    state: CellState;
    data: nbformat.ICodeCell | nbformat.IRawCell | nbformat.IMarkdownCell | IMessageCell | IZeppelinCell;
    extraLines?: number[];
}

export interface IMessageCell extends nbformat.IBaseCell {
    cell_type: 'messages';
    messages: string[];
}

export enum CursorPos {
    Top,
    Bottom,
    Current
}

export interface ICellViewModel {
    cell: ICell;
    type: NotebookType;
}

export type ClassType<T> = {
    new(...args: any[]): T;
};

// zeppelin
export interface IZeppelinCell {
    source: string;
    execution_count: number | undefined;
    cell_type: 'code';
    outputs: ParagraphResults;
}

export interface ParagraphResults {
    code?: 'ERROR' | 'SUCCESS'
    msg?: ParagraphIResultsMsgItem[];

    [index: number]: {};
}

export class ParagraphIResultsMsgItem {
    type: DatasetType = DatasetType.TEXT;
    data = '';
}

export enum DatasetType {
    NETWORK = 'NETWORK',
    TABLE = 'TABLE',
    HTML = 'HTML',
    TEXT = 'TEXT',
    // ANGULAR = 'ANGULAR',
    IMG = 'IMG'
}