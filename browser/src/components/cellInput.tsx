import * as nbformat from '@jupyterlab/nbformat';
import * as React from 'react';
import styled from 'styled-components'

import { concatMultilineStringInput } from '../utils/common';
import { ICellViewModel, ICell } from '../types';

const Container = styled.textarea`
width: 100%;
min-height: 100px;
border: none;
background: #f5f5f5;
padding: 0 10px;
box-sizing: border-box;
outline: none;
`

interface ICellInputProps {
    cellVM: ICellViewModel;
    onKeyDown(ev: React.KeyboardEvent): void
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
            <Container style={{ width: '100%', minHeight: "100px" }} onKeyDown={this.props.onKeyDown} value={this.props.cellVM.cell.data.source} onChange={(ev) => this.props.onCodeChange(ev, this.props.cellVM.cell)} ></Container>
        );
    };

    private renderMarkdownInputs = () => {
        if (this.shouldRenderMarkdownEditor()) {
            const source = concatMultilineStringInput(this.getMarkdownCell().source);
            return (
                <div className="cell-input">
                    {/* todo */}
                    <textarea style={{ width: '100%', minHeight: "100px" }} value={source} onChange={(ev) => this.props.onCodeChange(ev, this.props.cellVM.cell)} ></textarea>
                </div>
            );
        }

        return null;
    };
}
