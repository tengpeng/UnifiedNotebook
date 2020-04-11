import { createServer } from 'http'
import socketIO from 'socket.io'
import type { Server } from 'http'
import { createLogger } from 'bunyan'

const log = createLogger({ name: 'Socket' })

interface INotebookSocket {
    createSocketServer(app: Express.Application, port: number): NotebookSocket
}

export class NotebookSocket implements INotebookSocket {
    server: Server | undefined
    io: socketIO.Server | undefined
    socket: socketIO.Socket | undefined

    constructor() { }

    /**
     * create nodejs http server
     */
    createSocketServer(app: Express.Application, port: number) {
        this.server = createServer(app)
        this.io = socketIO.listen(this.server)
        this.server.listen(port)
        this.io.on('connection', this._onConnection)
        return this
    }

    private _onConnection(socket: socketIO.Socket) {
        log.info('socket connected')
        this.socket = socket
    }
}