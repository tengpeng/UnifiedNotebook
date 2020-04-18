import socketClient from 'socket.io-client'
import { ICell, isExecuteResultOutput, IResponse, ICellOutput, IExecuteResultOutput } from 'common/lib/types'

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
        // } else if () {
        // todo
    } else {
        console.warn(`Unknown message ${msg.type} : called by cell ${cell.id}`);
    }
}
function handleExecuteResult(msg: IExecuteResultOutput, cell: ICell) {
    console.log("handleExecuteResult -> msg", msg)
}

export default client
