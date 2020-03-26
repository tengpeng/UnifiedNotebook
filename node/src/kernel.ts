import { Session, SessionManager, KernelManager, KernelMessage } from '@jupyterlab/services'
import { createLogger } from 'bunyan'
const log = createLogger({ name: 'kernel' })

interface IOPubHandler {
    (msg: KernelMessage.IIOPubMessage): void
}
interface ReplyHandler {
    (reply: KernelMessage.IShellControlMessage): void
}

export const executeCode = async (session: Session.ISessionConnection, code: string, onIOPub: IOPubHandler, onReply: ReplyHandler) => {
    log.info('Execute code')
    if (!session) log.error('No active session')

    let future = session.kernel?.requestExecute({ code })

    if (future) {
        future.onIOPub = onIOPub
        future.onReply = onReply
        return future.done.catch(e => {
            log.error(e)
        })
    }
}