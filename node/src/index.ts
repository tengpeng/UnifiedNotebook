import { Session, SessionManager, KernelManager, KernelMessage, Kernel } from '@jupyterlab/services'
import * as path from 'path'
import * as utils from './utils'
import { NOTEBOOK_PATH } from './consts'
import express from 'express'
import cors from 'cors'
import { NBSocket } from './socket'
import { NBSessionManager } from './session-manager'
import { NBKernel } from './kernel'
import type { INBSessionManager } from './session-manager'
import type { INBKernel } from './kernel'

const testNotebook = path.join(NOTEBOOK_PATH, 'test1.ipynb')
const testKernelName = 'python'
const testCode = '1 + 1'

// options
let options: Session.ISessionOptions = {
    path: testNotebook,
    type: utils.isNotebookFile(testNotebook) ? 'notebook' : '',
    name: utils.getFileName(testNotebook),
    kernel: {
        name: testKernelName
    }
}

// sessionManager
let sessionManager: INBSessionManager | undefined
let kernel: INBKernel | undefined

const main = async () => {
    const app = express()
    const port = 8888

    // socketIO
    let nbSocket = new NBSocket().createSocketServer(app, 80)
    nbSocket.io?.on('connection', (socket: SocketIO.Socket) => {
        socket.emit('socketID', socket.client.id)
        // start session
        socket.on('session:start', async () => {
            console.log("TCL: main -> session:start")
            sessionManager = await new NBSessionManager().startNewSession(options)
            socket.emit('session:start:success')
            if (sessionManager?.session) {
                kernel = new NBKernel(sessionManager.session)
            }
        })
        // restart kernel
        socket.on('session:restart', async () => {
            console.log("TCL: main -> session:restart")
            if (kernel) {
                kernel.restart(() => {
                    socket.emit('session:restart:success')
                })
            }
        })
        // run code
        socket.on('session:runcell', async (code) => {
            console.log("TCL: main -> session:runcell")
            kernel?.execute(code, msg => {
                socket.emit('session:runcell:success', msg)
            })
        })
    })

    // express middleware
    app.use(cors())
    app.use(express.json())

    app.listen(port, () => {
        console.log(`API: http://localhost:${port}`)
    })
}
main()
