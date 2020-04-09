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

export const CellInput: React.FC<ICellInputProps> = (props) => {
    const isCodeCell = () => {
        return props.cellVM.cell.data.cell_type === 'code';
    };
    const isMarkdownCell = () => {
        return props.cellVM.cell.data.cell_type === 'markdown';
    };

    const getMarkdownCell = () => {
        return props.cellVM.cell.data as nbformat.IMarkdownCell;
    };

    const shouldRenderMarkdownEditor = (): boolean => {
        return isMarkdownCell();
    };

    const renderCodeInputs = () => {
        return (
            <Container style={{ width: '100%', minHeight: "100px" }} onKeyDown={props.onKeyDown} value={props.cellVM.cell.data.source} onChange={(ev) => props.onCodeChange(ev, props.cellVM.cell)} ></Container>
        );
    };
    const renderMarkdownInputs = () => {
        if (shouldRenderMarkdownEditor()) {
            const source = concatMultilineStringInput(getMarkdownCell().source);
            return (
                <div className="cell-input">
                    {/* todo */}
                    <textarea style={{ width: '100%', minHeight: "100px" }} value={source} onChange={(ev) => props.onCodeChange(ev, props.cellVM.cell)} ></textarea>
                </div>
            );
        }
        return null
    }

    return (
        isCodeCell()
            ? (renderCodeInputs())
            : renderMarkdownInputs() // todo
    )
}
