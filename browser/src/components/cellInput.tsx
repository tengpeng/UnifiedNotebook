import * as nbformat from '@jupyterlab/nbformat';
import * as React from 'react';

import { concatMultilineStringInput } from '../utils/common';
import { ICellViewModel, ICell } from '../types';

interface ICellInputProps {
    cellVM: ICellViewModel;
    onCodeChange(ev: React.ChangeEvent<HTMLTextAreaElement>, cell: ICell): void
}

export class CellInput extends React.Component<ICellInputProps> {
    public render() {
        if (this.isCodeCell()) {
            return this.renderCodeInputs();
        } else {
            // todo
            return this.renderMarkdownInputs();
        }
    }

    private isCodeCell = () => {
        return this.props.cellVM.cell.data.cell_type === 'code';
    };

    private isMarkdownCell = () => {
        return this.props.cellVM.cell.data.cell_type === 'markdown';
    };

    private getMarkdownCell = () => {
        return this.props.cellVM.cell.data as nbformat.IMarkdownCell;
    };

    private shouldRenderMarkdownEditor = (): boolean => {
        return this.isMarkdownCell();
    };

    private renderCodeInputs = () => {
        return (
            <div className="cell-input">
                <textarea value={this.props.cellVM.cell.data.source} onChange={(ev) => this.props.onCodeChange(ev, this.props.cellVM.cell)} ></textarea>
            </div>
        );
    };

    private renderMarkdownInputs = () => {
        if (this.shouldRenderMarkdownEditor()) {
            const source = concatMultilineStringInput(this.getMarkdownCell().source);
            return (
                <div className="cell-input">
                    {/* todo */}
                    <textarea value={source} onChange={(ev) => this.props.onCodeChange(ev, this.props.cellVM.cell)} ></textarea>
                </div>
            );
        }

        return null;
    };
}
