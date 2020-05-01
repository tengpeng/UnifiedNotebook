import { createServer } from 'http'
import socketIO from 'socket.io'
import type { Server } from 'http'
import { createLogger } from 'bunyan'
import { BackendManager } from './backend'
import { ICodeCell, INotebookJSON, INotebookCallbackPayload, IExposeVarPayload, IExposedVarMap, IExposedVarMapValue, IExposeVarOutput, isParameterCell, IKernelInfo } from 'common/lib/types'
import { NotebookManager } from './notebook'

const log = createLogger({ name: 'Socket' })

interface ISocketManager { }

export class SocketManager implements ISocketManager {
    server: Server | undefined
    io: socketIO.Server | undefined
    socket: socketIO.Socket | undefined
    backendManager: BackendManager
    notebookManager: NotebookManager
    // todo exposed var map manager
    exposedVarMap: IExposedVarMap = {}

    constructor(app: Express.Application, port: number, backendManager: BackendManager, notebookManager: NotebookManager) {
        this.server = createServer(app)
        this.io = socketIO.listen(this.server)
        this.server.listen(port)
        this.io.on('connection', this._onConnection.bind(this))
        this.backendManager = backendManager
        this.notebookManager = notebookManager
    }

    private _onConnection(socket: socketIO.Socket) {
        log.info('socket connected')
        this.socket = socket
        // bind handler
        log.info('socket connection success')
        socket.emit('socketID', socket.client.id)
        socket.on('nb.ping', this.onPing(socket))
        socket.on('kernel.list', this.onKernelList(socket))
        socket.on('kernel.shutdown.all', this.onKernelShutDownAll(socket))
        socket.on('kernel.running.list', this.onKernelRunningList(socket))
        // run code
        socket.on('cell.run', this.onCellRun(socket))
        socket.on('cell.interrupt', this.onCellInterrupt(socket))
        // run notebook
        socket.on('notebook.run', this.onNotebookRun(socket))
        // expose
        socket.on('expose.variable', this.onExposeVariable(socket))
        socket.on('expose.variable.list', this.onExposeVariableList(socket))
        socket.on('expose.variable.import', this.onExposeVariableImport(socket))

    }

    // exposed var map
    private updateExposeMap = (store: IExposedVarMapValue): void => {
        this.exposedVarMap[store.id] = store
    }

    private getExposedVarMapValueWithOutJsonData = (exposedVarMapValue: IExposedVarMapValue): IExposedVarMapValue => {
        let { id, payload } = exposedVarMapValue
        return { id, payload }
    }

    private createExposedVarMapValue(exposeVarOutput: IExposeVarOutput, exposeVarPayload: IExposeVarPayload): IExposedVarMapValue {
        let store: IExposedVarMapValue = {
            id: exposeVarPayload.exposeCell.id,
            payload: exposeVarPayload,
            jsonData: exposeVarOutput
        }
        this.updateExposeMap(store)
        return store
    }

    // socket handler
    private onPing = (socket: SocketIO.Socket) => {
        return () => {
            socket.emit('nb.pong')
        }
    }

    private onKernelList = (socket: SocketIO.Socket) => {
        return async () => {
            let kernels = await this.backendManager.kernels()
            socket.emit('kernel.list.ok', kernels)
        }
    }

    private onKernelShutDownAll = (socket: SocketIO.Socket) => {
        return async () => {
            this.backendManager.getBackend('Jupyter').shutdownAllKernel()
        }
    }

    private onKernelRunningList = (socket: SocketIO.Socket) => {
        return async () => {
            let kernels = await this.backendManager.getBackend('Jupyter').runningKernels()
            socket.emit('kernel.running.list.ok', kernels)
        }
    }

    private onCellRun = (socket: SocketIO.Socket) => {
        return async (cell: ICodeCell, kernelInfo?: IKernelInfo) => {
            try {
                if (isParameterCell(cell) && kernelInfo) {
                    let res = await this.backendManager.executeParameter(cell, kernelInfo)
                } else {
                    await this.backendManager.execute(cell, msg => {
                        socket.emit('cell.run.ok', { msg, cell })
                    })
                }
            } catch (error) {
                log.error(error)
            }
        }
    }

    private onCellInterrupt = (socket: SocketIO.Socket) => {
        return async (cell: ICodeCell) => {
            try {
                await this.backendManager.interrupt(cell)
            } catch (error) {
                log.error(error)
            }
        }
    }

    private onNotebookRun = (socket: SocketIO.Socket) => {
        return async (notebook: INotebookJSON) => {
            try {
                await this.notebookManager.loadNotebookJSON(notebook)
                await this.notebookManager.runNotebook((payload: INotebookCallbackPayload) => {
                    if (payload.finish) {
                        socket.emit('notebook.run.ok', payload)
                    } else {
                        socket.emit('notebook.run.progress', payload)
                    }
                }, false)
            } catch (error) {
                log.error(error)
            }
        }
    }

    private onExposeVariable = (socket: SocketIO.Socket) => {
        return async (exposeVarPayload: IExposeVarPayload) => {
            try {
                let exposeVarOutput = await this.backendManager.exposeVar(exposeVarPayload)
                let exposedVarMapValue = this.getExposedVarMapValueWithOutJsonData(this.createExposedVarMapValue(exposeVarOutput, exposeVarPayload))
                socket.emit('expose.variable.ok', exposedVarMapValue)
            } catch (error) {
                log.error(error)
            }
        }
    }

    private onExposeVariableList = (socket: SocketIO.Socket) => {
        return async () => {
            let _exposedVarMap: IExposedVarMap = {}
            for (const [id, val] of Object.entries(this.exposedVarMap)) {
                _exposedVarMap[id] = this.getExposedVarMapValueWithOutJsonData(val)
            }
            socket.emit('expose.variable.list.ok', _exposedVarMap)
        }
    }

    private onExposeVariableImport = (socket: SocketIO.Socket) => {
        return async (exposedVarMapValue: IExposedVarMapValue) => {
            try {
                log.info('import variable exposedVarMapValue')
                let _exposedVarMapValue: IExposedVarMapValue = this.exposedVarMap[exposedVarMapValue.payload.exposeCell.id]
                // merge payload
                _exposedVarMapValue.payload.importCell = exposedVarMapValue.payload.importCell
                _exposedVarMapValue.payload.importVarRename = exposedVarMapValue.payload.importVarRename
                let bool = await this.backendManager.importVar(_exposedVarMapValue)
                log.info('import variable finish: ', bool)
                socket.emit('expose.variable.import.ok', bool)
            } catch (error) {
                log.error(error)
            }
        }
    }
}