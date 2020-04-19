import React from 'react'
import { ICellViewModel, IStreamOutput, isStreamOutput } from 'common/lib/types.js'
import ansiUp from 'ansi_up'

interface Props {
    cellVM: ICellViewModel
}

export const Output: React.FC<Props> = ({ cellVM }) => {
    const renderCell = () => {
        // return <div>{JSON.stringify(cellVM.cell.outputs)}</div>
        return cellVM.cell.outputs.map((output, id) => {
            if (isStreamOutput(output)) {
                let ansiHTML = (new ansiUp).ansi_to_html((output as IStreamOutput).text)
                return <pre style={{ fontSize: '12px', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: ansiHTML }} key={id}></pre>
            } else {
                // todo
            }
        })
    }
    return (
        <>
            {renderCell()}
        </>
    )
}