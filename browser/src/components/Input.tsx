import React from 'react'
import { ICellViewModel } from '../types'

interface Props {
    cellVM: ICellViewModel
    onInputChange(event: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
    onKeyDown(ev: React.KeyboardEvent): void
}

export const Input: React.FC<Props> = ({ cellVM, onInputChange, onKeyDown }) => {
    const renderInput = () => {
        return <textarea
            style={{ width: '100%', minHeight: "100px" }}
            value={cellVM.cell.source}
            onKeyDown={onKeyDown}
            onChange={(event) => onInputChange(event, cellVM)} ></textarea>
    }
    return (
        <>
            {renderInput()}
        </>
    )
}