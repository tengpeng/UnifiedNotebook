import React from 'react'
import { ICellViewModel, IStreamOutput, isStreamOutput, CellType } from 'common/lib/types.js'
import ansiUp from 'ansi_up'
import ReactMarkdownRenderer from './markdown-renderer'

interface Props {
    cellVM: ICellViewModel
}

export const Output: React.FC<Props> = ({ cellVM }) => {
    const renderMarkdownOutput = () => {
        return <ReactMarkdownRenderer source={cellVM.cell.source} />
    }

    const renderCodeOutput = () => {
        return cellVM.cell.outputs.map((output, id) => {
            if (isStreamOutput(output)) {
                // eslint-disable-next-line
                let ansiHTML = (new ansiUp).ansi_to_html((output as IStreamOutput).text)
                return <pre style={{ fontSize: '12px', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: ansiHTML }} key={id}></pre>
            } else {
                // todo
                return null
            }
        })
    }

    const render = () => {
        return cellVM.cell.type === CellType.CODE ? renderCodeOutput() : renderMarkdownOutput()
    }
    return (
        <>
            {render()}
        </>
    )
}