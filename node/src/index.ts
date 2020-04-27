import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { NotebookSocket } from './socket'
import { JupyterKernel } from './kernel/jupyter'
import { ZeppelinKernel } from './kernel/zeppelin'
import { BackendManager } from './backend'
import { ICodeCell, IExposedVarMap, IExposedVarMapValue, IExposeVarPayload, IExposeVarOutput, INotebookJSON, INotebookCallbackPayload } from 'common/lib/types'
import { createLogger } from 'bunyan'
import { NotebookManager, INotebookManager } from './notebook'

let log = createLogger({ name: 'Main' })

dotenv.config()

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    const backendManager = new BackendManager()
    backendManager.register(await new JupyterKernel().init())
    // backendManager.register(await new ZeppelinKernel().init())

    // init notebook runner
    const notebookManager = new NotebookManager(backendManager)

    // exposed variable
    let exposedVarMap: IExposedVarMap = {}
    const updateExposeMap = (store: IExposedVarMapValue): void => {
        exposedVarMap[store.id] = store
    }
    const createExposedVarMapValue = (exposeVarOutput: IExposeVarOutput, exposeVarPayload: IExposeVarPayload): IExposedVarMapValue => {
        let store: IExposedVarMapValue = {
            id: exposeVarPayload.exposeCell.id,
            payload: exposeVarPayload,
            jsonData: exposeVarOutput
        }
        updateExposeMap(store)
        return store
    }
    const getExposedVarMapValueWithOutJsonData = (exposedVarMapValue: IExposedVarMapValue): IExposedVarMapValue => {
        let { id, payload } = exposedVarMapValue
        return { id, payload }
    }
    const clearExposeMap = () => {
        log.info('clear exposeMap cache')
        exposedVarMap = {}
    }

    // socketIO
    let notebookSocket = new NotebookSocket().createSocketServer(app, 80)
    if (notebookSocket.io) {
        notebookSocket.io.on('connection', (socket: SocketIO.Socket) => {
            log.info('socket connection success')
            socket.emit('socketID', socket.client.id)
            socket.on('nb.ping', () => {
                socket.emit('nb.pong')
            })
            socket.on('kernel.list', async () => {
                let kernels = await backendManager.kernels()
                socket.emit('kernel.list.ok', kernels)
            })
            socket.on('kernel.shutdown.all', () => {
                backendManager.getBackend('Jupyter').shutdownAllKernel()
            })
            socket.on('kernel.running.list', async () => {
                let kernels = await backendManager.getBackend('Jupyter').runningKernels()
                socket.emit('kernel.running.list.ok', kernels)
            })
            // run code
            socket.on('cell.run', async (cell: ICodeCell) => {
                try {
                    await backendManager.execute(cell, msg => {
                        socket.emit('cell.run.ok', { msg, cell })
                    })
                } catch (error) {
                    log.error(error)
                }
            })
            socket.on('cell.interrupt', async (cell: ICodeCell) => {
                try {
                    await backendManager.interrupt(cell)
                } catch (error) {
                    log.error(error)
                }
            })
            // run notebook
            socket.on('notebook.run', async (notebook: INotebookJSON) => {
                try {
                    await notebookManager.loadNotebookJSON(notebook)
                    await notebookManager.runNotebook((payload: INotebookCallbackPayload) => {
                        if (payload.finish) {
                            socket.emit('notebook.run.ok', payload)
                        } else {
                            socket.emit('notebook.run.progress', payload)
                        }
                    })
                } catch (error) {
                    log.error(error)
                }
            })
            // expose
            socket.on('expose.variable', async (exposeVarPayload: IExposeVarPayload) => {
                try {
                    let exposeVarOutput = await backendManager.exposeVar(exposeVarPayload)
                    let exposedVarMapValue = getExposedVarMapValueWithOutJsonData(createExposedVarMapValue(exposeVarOutput, exposeVarPayload))
                    socket.emit('expose.variable.ok', exposedVarMapValue)
                } catch (error) {
                    log.error(error)
                }
            })
            socket.on('expose.variable.list', async () => {
                let _exposedVarMap: IExposedVarMap = {}
                for (const [id, val] of Object.entries(exposedVarMap)) {
                    _exposedVarMap[id] = getExposedVarMapValueWithOutJsonData(val)
                }
                socket.emit('expose.variable.list.ok', _exposedVarMap)
            })
            socket.on('expose.variable.import', async (exposedVarMapValue: IExposedVarMapValue) => {
                try {
                    log.info('import variable exposedVarMapValue')
                    let _exposedVarMapValue: IExposedVarMapValue = exposedVarMap[exposedVarMapValue.payload.exposeCell.id]
                    // merge payload
                    _exposedVarMapValue.payload.importCell = exposedVarMapValue.payload.importCell
                    _exposedVarMapValue.payload.importVarRename = exposedVarMapValue.payload.importVarRename
                    let bool = await backendManager.importVar(_exposedVarMapValue)
                    log.info('import variable finish: ', bool)
                    socket.emit('expose.variable.import.ok', bool)
                } catch (error) {
                    log.error(error)
                }
            })
        })

        notebookSocket.io.on('connect', () => {
            // clearExposeMap()
        })
    }

    // express middleware
    app.use(cors())
    app.use(express.json())

    app.listen(port, () => {
        log.info(`API: http://localhost:${port}`)
    })
}
main()
