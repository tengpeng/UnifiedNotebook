import React from 'react'
import { ICellViewModel, CellType } from 'common/lib/types.js'

interface Props {
    cellVM: ICellViewModel
    onInputChange(event: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
    onKeyDown(ev: React.KeyboardEvent): void
}

export const Input: React.FC<Props> = ({ cellVM, onInputChange, onKeyDown }) => {

    const renderMarkdownInput = () => {
        return <textarea
            style={{ width: '100%', minHeight: "100px" }}
            value={cellVM.cell.source}
            placeholder="markdown"
            onKeyDown={onKeyDown}
            onChange={(event) => onInputChange(event, cellVM)} ></textarea>
    }

    const renderCodeInput = () => {
        return <textarea
            style={{ width: '100%', minHeight: "100px" }}
            value={cellVM.cell.source}
            placeholder="code"
            onKeyDown={onKeyDown}
            onChange={(event) => onInputChange(event, cellVM)} ></textarea>
    }

    const render = () => {
        return cellVM.cell.type === CellType.MARKDOWN ? renderMarkdownInput() : renderCodeInput()
    }

    return (
        <>
            {render()}
        </>
    )
}