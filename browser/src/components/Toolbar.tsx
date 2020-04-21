import React from 'react'
import { INotebookViewModel } from 'common/lib/types.js'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { store } from '../store'
import client from '../socket'
import { exampleCells } from '../utils/exampleNotebook'

const Toolbar: React.FC<IState> = (props) => {
    // * example notebook data
    const loadExampleNotebook = () => {
        let temp = {
            cells: exampleCells().cells
        }
        let data: INotebookViewModel = {
            notebook: { cells: [] }
        }
        temp.cells.forEach(cellItem => {
            data.notebook.cells.push({ cell: cellItem, exposed: '' })
        })
        console.log("loadExampleNotebook -> data", data)

        store.dispatch({ type: 'updateNotebook', payload: data })
    }

    const shutDownAllKernels = () => {
        client.emit('kernel.shutdown.all')
    }

    const clearAllOutputs = () => {
        store.dispatch({ type: 'clearAllOutputs' })
    }

    return (
        <div>
            <button onClick={loadExampleNotebook}>load example notebook</button>
            <button onClick={() => {
                client.emit('nb.ping')
            }}>ping</button>
            <button onClick={shutDownAllKernels}>shutdown all kernels</button>
            <button onClick={clearAllOutputs}>clear all outputs</button>
            <a style={{ fontSize: '12px' }} download="notebookJSON.json" href={'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.getState(), null, 2))}>download state</a>
        </div>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Toolbar)