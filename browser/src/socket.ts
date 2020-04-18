import io from 'socket.io-client'
import { ICell, isExecuteResultOutput, IResponse, ICellOutput, IExecuteResultOutput } from 'common/lib/types'

export class Socket {
    url: string
    opts: SocketIOClient.ConnectOpts
    io: SocketIOClient.Socket

    constructor(url: string = 'http://localhost:80', opts: SocketIOClient.ConnectOpts = { reconnection: true }) {
        this.url = url
        this.opts = opts
        this.io = io(this.url, this.opts)
    }

    init() {
        this.io.on('socketID', this.handleSocketID.bind(this))
        this.io.on('cell.run.ok', this.handleRunCellSuccess.bind(this))
        this.io.on('nb.pong', () => console.log('pong'))
    }

    // event
    handleSocketID(id: string) {
        console.log("handleSocketID -> id", id)
    }
    handleRunCellSuccess(res: IResponse) {
        console.log("handleRunCellSuccess -> res", res)
        let msg: ICellOutput = res.msg
        let cell: ICell = res.cell
        if (isExecuteResultOutput(msg)) {
            this.handleExecuteResult(msg as IExecuteResultOutput, cell)
            // } else if () {
            // todo
        } else {
            console.warn(`Unknown message ${msg.type} : called by cell ${cell.id}`);
        }
    }
    handleExecuteResult(msg: IExecuteResultOutput, cell: ICell) {
        console.log("handleExecuteResult -> msg", msg)
    }
}