import React from 'react'
import { ICellViewModel, IStreamOutput, isStreamOutput, CellType, isExecuteResultOutput, IExecuteResultOutput, isErrorOutput, IErrorOutput, ICellOutput } from 'common/lib/types.js'
import ansiUp from 'ansi_up'
import ReactMarkdownRenderer from './markdown-renderer'
import ReactJson from 'react-json-view'

interface Props {
    cellVM: ICellViewModel
}

export const Output: React.FC<Props> = ({ cellVM }) => {
    const renderMarkdownOutput = () => {
        return <ReactMarkdownRenderer source={cellVM.cell.source} />
    }

    const handleStreamOutput = (output: ICellOutput, id: number) => {
        // eslint-disable-next-line
        let ansiHTML = (new ansiUp).ansi_to_html((output as IStreamOutput).text)
        return <pre style={{ fontSize: '12px', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: ansiHTML }} key={id}></pre>
    }

    const handleExecuteResultOutput = (output: ICellOutput, id: number) => {
        let data = (output as IExecuteResultOutput).data
        if (data["text/html"]) {
            return <div key={id} dangerouslySetInnerHTML={{ __html: data['text/html'] }}></div>
        } else if (data['application/json']) {
            return <ReactJson key={id} src={(data['application/json'] as Object)} />
        } else if (data['text/plain']) {
            return <pre key={id}>{data['text/plain']}</pre>
        } else {
            return null
        }
    }

    const handleErrorOutput = (output: ICellOutput, id: number) => {
        let { ename, evalue, traceback } = (output as IErrorOutput)
        // eslint-disable-next-line
        let htmls = traceback.map((text: string) => (new ansiUp).ansi_to_html(text))
        return (
            <div key={id} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                <div>{ename}</div>
                <div>{evalue}</div>
                {htmls.map((html: string, index: number) => <pre key={index} dangerouslySetInnerHTML={{ __html: html }}></pre>)}
            </div>
        )
    }

    const renderCodeOutput = () => {
        return cellVM.cell.outputs.map((output, id) => {
            if (isStreamOutput(output)) {
                return handleStreamOutput(output, id)
            } else if (isExecuteResultOutput(output)) {
                return handleExecuteResultOutput(output, id)
            } else if (isErrorOutput(output)) {
                return handleErrorOutput(output, id)
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