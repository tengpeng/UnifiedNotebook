import * as nbformat from '@jupyterlab/nbformat'

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
    data: nbformat.ICodeCell | nbformat.IRawCell | nbformat.IMarkdownCell | IMessageCell;
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
}

export type ClassType<T> = {
    new(...args: any[]): T;
};