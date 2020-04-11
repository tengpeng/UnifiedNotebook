import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { NotebookSocket } from './socket'
import { ZeppelinKernel, IZeppelinKernel } from './kernel/zeppelin'
import { JupyterKernel, IJupyterKernel } from './kernel/jupyter'

dotenv.config()

let jupyter: IJupyterKernel | undefined
let zeppelin: IZeppelinKernel | undefined

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    zeppelin = await new ZeppelinKernel().init()
    jupyter = await new JupyterKernel().init()

    // socketIO
    let notebookSocket = new NotebookSocket().createSocketServer(app, 80)
    notebookSocket.io?.on('connection', (socket: SocketIO.Socket) => {
        socket.emit('socketID', socket.client.id)
        // restart kernel
        socket.on('session:restart', async () => {
            console.log("TCL: main -> session:restart")
            if (jupyter) {
                jupyter.restart(() => {
                    socket.emit('session:restart:success')
                })
            }
        })
        // run code
        socket.on('session:runcell', async (code) => {
            console.log("TCL: main -> session:runcell")
            jupyter?.execute(code, msg => {
                socket.emit('session:runcell:success', msg)
            })
        })
        socket.on('session:runcell:zeppelin', async (code) => {
            console.log("main -> session:runcell:zeppelin")
            if (zeppelin) {
                let paragraphId = await zeppelin.createParagraph(zeppelin.noteId, code)
                let res = await zeppelin.runParagraph(zeppelin.noteId, paragraphId)
                socket.emit('session:runcell:zeppelin:success', res)
            }
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
