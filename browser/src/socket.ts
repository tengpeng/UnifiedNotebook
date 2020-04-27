import socketClient from 'socket.io-client'
import { IExposedVarMapValue, ICell, isExecuteResultOutput, isStatusOutput, isStreamOutput, IResponse, ICellOutput, IExecuteResultOutput, IStatusOutput, IStreamOutput, isErrorOutput, IErrorOutput, isClearOutput, IClearOutput, IKernelSpecs, IExposedVarMap, INotebookCallbackPayload } from 'common/lib/types'
import { store } from './store'
import { cloneCurrentCellVM, cloneNotebookVM } from './store/utils'

let client = socketClient('http://localhost:80', { reconnection: true })
client.on('socketID', handleSocketID)
client.on('cell.run.ok', handleRunCellSuccess)
client.on('notebook.run.progress', handleRunNotebookProgress)
client.on('notebook.run.ok', handleRunNotebookSuccess)
client.on('kernel.list.ok', handleGetKernels)
client.on('kernel.running.list.ok', (res: any) => { console.log(JSON.stringify(res.map((item: any) => item.name))) })
client.on('expose.variable.ok', handleExposeVariable)
client.on('expose.variable.list.ok', handleExposeVariableList)
client.on('expose.variable.import.ok', (res: any) => { console.log('import variable: ', res) })
client.on('nb.pong', () => console.log('pong'))

// event
// result
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
    } else if (isErrorOutput(msg)) {
        handleErrorOutput(msg as IErrorOutput, cell)
    } else if (isClearOutput(msg)) {
        handleClearOutput(msg as IClearOutput, cell)
    } else {
        console.warn(`Unknown message ${msg.type} : called by cell ${cell.id}`);
    }
}

function handleExecuteResult(msg: IExecuteResultOutput, cell: ICell) {
    let newCellVM = cloneCurrentCellVM(cell)
    newCellVM.cell.outputs = [msg]
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
}

function handleStatusOutput(msg: IStatusOutput, cell: ICell) {
    let newCellVM = cloneCurrentCellVM(cell)
    newCellVM.cell.state = msg.state
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
}

function handleStreamOutput(msg: IStreamOutput, cell: ICell) {
    let newCellVM = cloneCurrentCellVM(cell)
    newCellVM.cell.outputs.push(msg)
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
}

function handleErrorOutput(msg: IErrorOutput, cell: ICell) {
    let newCellVM = cloneCurrentCellVM(cell)
    newCellVM.cell.outputs.push(msg)
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
}

function handleClearOutput(msg: IClearOutput, cell: ICell) {
    let newCellVM = cloneCurrentCellVM(cell)
    newCellVM.cell.outputs = []
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
}

// notebook
function handleRunNotebookProgress(payload: INotebookCallbackPayload) {
    console.log("handleRunNotebookProgress -> payload", payload)
}

function handleRunNotebookSuccess(payload: INotebookCallbackPayload) {
    console.log("handleRunNotebookSuccess -> payload", payload)
    let notebookVM = store.getState().notebookVM
    let _notebookVM = cloneNotebookVM(notebookVM)
    store.dispatch({ type: 'updateNotebookVM', payload: _notebookVM })
}

// kernel
function handleGetKernels(msg: IKernelSpecs) {
    store.dispatch({ type: 'updateKernels', payload: msg })
}

// expose
function handleExposeVariable(exposedVarMapValue: IExposedVarMapValue) {
    console.log("handleExposeVariable -> exposedVarMapValue", exposedVarMapValue)
    let newCellVM = cloneCurrentCellVM(exposedVarMapValue.payload.exposeCell)
    newCellVM.exposed = exposedVarMapValue.payload.exposeVar
    store.dispatch({ type: 'updateCellVM', payload: newCellVM })
    client.emit('expose.variable.list')
}
function handleExposeVariableList(exposedVarMap: IExposedVarMap) {
    console.log("handleExposeVariableList -> exposedVarMap", exposedVarMap)
    store.dispatch({ type: 'uploadExposedVarMap', payload: exposedVarMap })
}

export default client
