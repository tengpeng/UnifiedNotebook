import { Session, SessionManager, KernelManager, KernelMessage } from '@jupyterlab/services'
import * as path from 'path'
import { getKernelSpecsList } from './kernelspec'
import { startNew, shutdown } from './session'
import * as utils from './utils'
import { NOTEBOOK_PATH } from './consts'

namespace Handler {
    export const onReply = (reply: KernelMessage.IShellControlMessage) => {
        console.log("TCL: reply", reply)
    }
    export const onIOPub = (msg: KernelMessage.IIOPubMessage) => {
        console.log("TCL: msg type", msg.header.msg_type)
        console.log("TCL: msg content", msg.content)
    }
}

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

// kernel
const kernelManager = new KernelManager()
const sessionManager = new SessionManager({ kernelManager })

// session
let session: Session.ISessionConnection | undefined;

const main = async () => {
    await getKernelSpecsList()
    session = await startNew(options, sessionManager)
    if (!session) return

    let future = session.kernel?.requestExecute({ code: testCode })

    if (future) {
        future.onIOPub = Handler.onIOPub
        future.onReply = Handler.onReply
        await future.done.catch(e => {
            console.error(e)
            session && shutdown(session, 1)
        })
    }

    shutdown(session)
}
main()
