import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { SocketManager } from './socket'
import { JupyterKernel } from './kernel/jupyter'
import { ZeppelinKernel } from './kernel/zeppelin'
import { BackendManager } from './backend'
import { createLogger } from 'bunyan'
import { NotebookManager } from './notebook'

let log = createLogger({ name: 'Main' })

dotenv.config()

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    const backendManager = new BackendManager()
    backendManager.register(await new JupyterKernel().init())
    backendManager.register(await new ZeppelinKernel().init())

    // init notebook runner
    const notebookManager = new NotebookManager(backendManager)

    // socketIO
    const socketManager = new SocketManager(app, 80, backendManager, notebookManager)

    // express middleware
    app.use(cors())
    app.use(express.json())
    app.listen(port, () => {
        log.info(`API: http://localhost:${port}`)
    })
}
main()
