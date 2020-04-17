import React from 'react'
import { ICellViewModel } from 'common/lib/types.js'

interface Props {
    cellVM: ICellViewModel
}

export const Output: React.FC<Props> = ({ cellVM }) => {
    const renderCell = () => {
        return <div>{cellVM.cell.outputs.length}</div>
    }
    return (
        <>
            {renderCell()}
        </>
    )
}