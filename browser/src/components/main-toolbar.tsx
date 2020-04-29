import React, { useState } from 'react'
import { INotebookViewModel, INotebookJSON, ICell } from 'common/lib/types.js'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { store } from '../store'
import client from '../socket'
import { exampleCells, parameterExampleCells } from '../utils/exampleNotebook'

const MainToolbar: React.FC<IState> = (props) => {
    const [notebookName, setNotebookName] = useState('unified-notebook')

    const loadNotebook = (cells: ICell[]) => {
        let temp = {
            cells
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

    // * example notebook data
    const loadExampleNotebook = () => {
        loadNotebook(exampleCells().cells)
    }

    const loadParameterExampleNotebook = () => {
        loadNotebook(parameterExampleCells().cells)
    }

    const getNotebookJSON = (): INotebookJSON => {
        let notebook = props.notebookVM.notebook
        let cellVMs = notebook.cells
        let cells = cellVMs.map(vm => vm.cell)
        let notebookJSON = {
            cells
        }
        return notebookJSON
    }

    const onChangeNotebookName = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        setNotebookName(val)
    }

    const runNotebook = () => {
        let notebookJSON = getNotebookJSON()
        client.emit('notebook.run', notebookJSON)
    }

    const shutDownAllKernels = () => {
        client.emit('kernel.shutdown.all')
    }

    const clearAllOutputs = () => {
        store.dispatch({ type: 'clearAllOutputs' })
    }

    return (
        <div style={{ background: '#ccc', padding: '10px' }}>
            <span> load: </span>
            <button onClick={loadExampleNotebook}>example notebook</button>
            <button onClick={loadParameterExampleNotebook}>parameter example notebook</button>
            <br />
            <button onClick={runNotebook}>run notebook</button>
            <span> | </span>
            <input onChange={onChangeNotebookName} value={notebookName} type="text" />
            <a style={{ fontSize: '12px' }} download={`${notebookName}.json`} href={'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(getNotebookJSON(), null, 2))}>download notebook</a>
            <br />
            <button onClick={() => {
                client.emit('nb.ping')
            }}>ping</button>
            <button onClick={shutDownAllKernels}>shutdown all kernels</button>
            <button onClick={clearAllOutputs}>clear all outputs</button>
        </div>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(MainToolbar)