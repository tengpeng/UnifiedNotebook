import { createLogger } from 'bunyan'
import { Session, KernelManager, SessionManager } from "@jupyterlab/services";

const log = createLogger({ name: 'SessionManager' })

export interface INBSessionManager {
    session: Session.ISessionConnection | undefined
    sessionManager: SessionManager
    startNewSession(options: Session.ISessionOptions): Promise<INBSessionManager | undefined>
    shutdown(): void
}

export class NBSessionManager implements INBSessionManager {
    session: Session.ISessionConnection | undefined
    sessionManager: SessionManager

    constructor() {
        this.sessionManager = new SessionManager({ kernelManager: new KernelManager() })
    }

    /**
     * create a new session
     */
    public startNewSession(options: Session.ISessionOptions) {
        return this.sessionManager.startNew(options).then((session: Session.ISessionConnection) => {
            this.session = session
            log.info('new session started')
            return this
        }).catch(e => {
            log.error(e)
            return undefined
        })
    }

    /**
     * shutdown a session
     */
    public shutdown() {
        this.session?.shutdown()
        log.info('session shutdown')
    }
}