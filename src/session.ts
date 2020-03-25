import { Session, SessionManager, KernelManager, KernelMessage } from '@jupyterlab/services'
import { createLogger } from 'bunyan'
const log = createLogger({ name: 'session' })

export const startNew = (options: Session.ISessionOptions, sessionManager: SessionManager) => {
    return sessionManager.startNew(options).catch(e => {
        log.error(e)
        return undefined
    })
}
export const shutdown = (session: Session.ISessionConnection, type: number = 0) => {
    session.shutdown()
    process.exit(type)
}