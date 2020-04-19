import socketClient from 'socket.io-client'
import { ICell, isExecuteResultOutput, isStatusOutput, isStreamOutput, IResponse, ICellOutput, IExecuteResultOutput, IStatusOutput, IStreamOutput } from 'common/lib/types'
import { store } from './store'
import cloneDeep from 'lodash/cloneDeep'

let client = socketClient('http://localhost:80', { reconnection: true })
client.on('socketID', handleSocketID)
client.on('cell.run.ok', handleRunCellSuccess)
client.on('nb.pong', () => console.log('pong'))

// event
function handleSocketID(id: string) {
    console.log("handleSocketID -> id", id)
}
function handleRunCellSuccess(res: IResponse) {
    console.log("handleRunCellSuccess -> res", res)
    let msg: ICellOutput = res.msg
    let cell: ICell = res.cell
    if (isExecuteResultOutput(msg)) {
        handleExecuteResult(msg as IExecuteResultOutput, cell)
    } else if (isStatusOutput(msg)) {
        handleStatusOutput(msg as IStatusOutput, cell)
    } else if (isStreamOutput(msg)) {
        handleStreamOutput(msg as IStreamOutput, cell)
    } else {
        console.warn(`Unknown message ${msg.type} : called by cell ${cell.id}`);
    }
}
function handleExecuteResult(msg: IExecuteResultOutput, cell: ICell) {
    let cellVM = getCurrentCellVM(cell)
    let newCell = cloneDeep(cellVM.cell)
    newCell.outputs = [msg]
    store.dispatch({ type: 'updateCell', payload: newCell })
}
function handleStatusOutput(msg: IStatusOutput, cell: ICell) {
    let cellVM = getCurrentCellVM(cell)
    let newCell = cloneDeep(cellVM.cell)
    newCell.state = msg.state
    store.dispatch({ type: 'updateCell', payload: newCell })
}
function handleStreamOutput(msg: IStreamOutput, cell: ICell) {
    let cellVM = getCurrentCellVM(cell)
    let newCell = cloneDeep(cellVM.cell)
    newCell.outputs.push(msg)
    store.dispatch({ type: 'updateCell', payload: newCell })
}

// store
function getCurrentCellVM(cell: ICell) {
    let state = store.getState()
    let currentCells = state.notebookVM.notebook.cells
    let index = currentCells.findIndex(item => item.cell.id === cell.id)
    return currentCells[index]
}

export default client
