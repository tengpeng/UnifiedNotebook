import React from 'react'
import { ICellViewModel } from 'common/lib/types.js'

interface Props {
    cellVM: ICellViewModel
    onInputChange(event: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
    onChangeCellLenguage(language: string): void
    onRunCell(): void
    onKeyDown(ev: React.KeyboardEvent): void
}

export const Input: React.FC<Props> = ({ cellVM, onInputChange, onKeyDown, onChangeCellLenguage, onRunCell }) => {

    const renderToolbar = () => {
        return <>
            <div>
                <span>language: {cellVM.cell.language}</span>
            </div>
            <button onClick={() => { onChangeCellLenguage('python') }}>python</button>
            <button onClick={() => { onChangeCellLenguage('sh') }}>sh</button>
            <button onClick={onRunCell}>run cell</button>
        </>
    }

    const renderInput = () => {
        return <textarea
            style={{ width: '100%', minHeight: "100px" }}
            value={cellVM.cell.source}
            onKeyDown={onKeyDown}
            onChange={(event) => onInputChange(event, cellVM)} ></textarea>
    }
    return (
        <>
            {renderToolbar()}
            {renderInput()}
        </>
    )
}