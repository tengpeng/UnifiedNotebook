import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { NotebookSocket } from './socket'
import socketIO from 'socket.io'
import { ZeppelinKernel, IZeppelinKernel } from './kernel/zeppelin'
import { JupyterKernel, IJupyterKernel } from './kernel/jupyter'
import { ICell } from 'common/lib/types'
import { createServer } from 'http'

dotenv.config()

let jupyter: IJupyterKernel | undefined
// let zeppelin: IZeppelinKernel | undefined

const main = async () => {
    const app = express()
    const port = process.env.EXPRESS_PORT

    // init zeppelin and jupyter
    // zeppelin = await new ZeppelinKernel().init()
    jupyter = await new JupyterKernel().init()

    // jupyter.execute('1+1', msg => { console.log(msg) })

    // socketIO
    let notebookSocket = new NotebookSocket().createSocketServer(app, 80)
    console.log("main -> notebookSocket")
    if (notebookSocket.io) {
        notebookSocket.io.on('connection', (socket: SocketIO.Socket) => {
            socket.emit('socketID', socket.client.id)
            socket.on('nb.ping', () => {
                console.log("main -> ping")
                socket.emit('nb.pong')
            })
            // restart kernel
            // socket.on('session:restart', async () => {
            //     console.log("TCL: main -> session:restart")
            //     if (jupyter) {
            //         jupyter.restart(() => {
            //             socket.emit('session:restart:success')
            //         })
            //     }
            // })
            // run code
            socket.on('cell.run', (cell: ICell) => {
                jupyter?.execute(cell.source, msg => {
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
