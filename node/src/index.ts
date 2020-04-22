import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { NotebookSocket } from './socket'
import { JupyterKernel, IJupyterKernel } from './kernel/jupyter'
import { ZeppelinKernel } from './kernel/zeppelin'
import { BackendManager } from './backend'
import { ICodeCell, IExposedMap, IExposePayload, IExposedMapMetaData, IExposedMapMetaDataValue } from 'common/lib/types'

dotenv.config()

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    const backendManager = new BackendManager()
    backendManager.register(await new JupyterKernel().init())
    backendManager.register(await new ZeppelinKernel().init())

    // exposed variable
    let exposedMap: IExposedMap = {}
    const clearExposeMap = () => {
        console.log("clearExposeMap -> clearExposeMap")
        exposedMap = {}
    }

    // socketIO
    let notebookSocket = new NotebookSocket().createSocketServer(app, 80)
    console.log("main -> notebookSocket")
    if (notebookSocket.io) {
        notebookSocket.io.on('connection', (socket: SocketIO.Socket) => {
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
                await backendManager.execute(cell, msg => {
                    socket.emit('cell.run.ok', { msg, cell })
                })
            })
            // expose
            socket.on('expose.variable', async (payload: IExposePayload) => {
                let exposeOutput = await backendManager.expose(payload)
                let store = {
                    id: payload.cell.id,
                    payload,
                    jsonData: exposeOutput
                }
                exposedMap[store.id] = store
                socket.emit('expose.variable.ok', { exposedMapKey: store.id, jsonData: exposeOutput, payload })
            })
            socket.on('expose.variable.list', async () => {
                let exposedMapMetaData: IExposedMapMetaData = {}
                for (const [id, val] of Object.entries(exposedMap)) {
                    let { payload } = val
                    exposedMapMetaData[id] = {
                        id, payload
                    }
                }
                socket.emit('expose.variable.list.ok', exposedMapMetaData)
            })
            socket.on('expose.variable.import', async (payload: IExposedMapMetaDataValue) => {
                let exposedMapValue = exposedMap[payload.id]
                console.log("main -> exposedMapValue", exposedMapValue)
                await backendManager.import(payload, exposedMapValue)
            })
        })

        notebookSocket.io.on('connect', () => {
            clearExposeMap()
        })
    }

    // express middleware
    app.use(cors())
    app.use(express.json())

    app.listen(port, () => {
        console.log(`API: http://localhost:${port}`)
    })
}
main()
