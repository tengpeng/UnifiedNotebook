import { Session, SessionManager, KernelManager, KernelMessage, Kernel } from '@jupyterlab/services'
import * as path from 'path'
import { executeCode } from './kernel'
import { getKernelSpecsList } from './kernelspec'
import { startNew, shutdown } from './session'
import * as utils from './utils'
import { NOTEBOOK_PATH } from './consts'
import express from 'express'
import cors from 'cors'

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

// session
let session: Session.ISessionConnection | undefined;

const main = async () => {
    const app = express()
    const port = 8080

    app.use(cors())
    app.use(express.json())
    // set new session
    app.get('/', async (req, res) => {
        await init()
        res.end(JSON.stringify({ status: 'ok', data: {} }))
    })
    // run cell
    app.post('/cell/run-cell', async (req, res) => {
        let msgList: Array<KernelMessage.IIOPubMessage> = []
        let replyList: Array<KernelMessage.IShellControlMessage> = []
        session && await executeCode(session, req.body.code, (msg) => {
            msgList.push(msg)
        }, (reply) => {
            replyList.push(reply)
        })
        res.send(JSON.stringify({ status: 'ok', data: { msgList, replyList } }))
    })
    // shutdown session
    app.get('/session/shutdown', async (req, res) => {
        session && shutdown(session)
        res.end()
    })

    app.listen(port, () => {
        console.log(`API: http://localhost:${port}`)
    })
}
main()

const init = async () => {
    // kernel
    const kernelManager = new KernelManager()
    const sessionManager = new SessionManager({ kernelManager })

    await getKernelSpecsList()
    session = await startNew(options, sessionManager)
}
