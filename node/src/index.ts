import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { NotebookSocket } from './socket'
import { JupyterKernel, IJupyterKernel } from './kernel/jupyter'
import { ICodeCell } from 'common/lib/types'

dotenv.config()

let jupyter: IJupyterKernel | undefined
// let zeppelin: IZeppelinKernel | undefined

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    // zeppelin = await new ZeppelinKernel().init()
    jupyter = await new JupyterKernel().init()

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
                let kernels = await JupyterKernel.kernels()
                socket.emit('kernel.list.ok', kernels)
            })
            socket.on('kernel.shutdown.all', () => {
                jupyter?.shutdownAllKernel()
            })
            socket.on('kernel.running.list', async () => {
                let kernels = await jupyter?.runningKernels()
                socket.emit('kernel.running.list.ok', kernels)
            })
            // run code
            socket.on('cell.run', async (cell: ICodeCell) => {
                await jupyter?.execute(cell, msg => {
                    socket.emit('cell.run.ok', { msg, cell })
                })
            })
            // socket.on('session:runcell:zeppelin', async (code) => {
            //     console.log("main -> session:runcell:zeppelin")
            //     if (zeppelin) {
            //         let paragraphId = await zeppelin.createParagraph(zeppelin.noteId, code)
            //         let res = await zeppelin.runParagraph(zeppelin.noteId, paragraphId)
            //         socket.emit('session:runcell:zeppelin:success', res)
            //     }
            // })
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
