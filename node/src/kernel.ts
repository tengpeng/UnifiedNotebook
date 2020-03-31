import { createLogger } from 'bunyan'

import type { Session, KernelMessage } from "@jupyterlab/services";

const log = createLogger({ name: 'Kernel' })

type ResultsCallback = {
    (message: KernelMessage.IMessage): void
}

export interface INBKernel {
    interrupt(): void
    shutdown(): void
    restart(): void
    execute(code: string, onResults: ResultsCallback): void
    destroy(): void
}

export class NBKernel implements INBKernel {
    session: Session.ISessionConnection;

    constructor(
        session: Session.ISessionConnection
    ) {
        this.session = session;
        this.session.statusChanged.connect(() => { });
    }

    interrupt() {
        this.session.kernel?.interrupt();
    }

    shutdown() {
        this.session.kernel?.shutdown();
    }

    restart(onRestarted?: Function) {
        const future = this.session.kernel?.restart();
        future && future.then(() => {
            if (onRestarted) onRestarted();
        });
    }

    execute(code: string, onResults: ResultsCallback) {
        const future = this.session.kernel?.requestExecute({ code });
        if (future) {
            future.onIOPub = message => {
                log.info("WSKernel: execute:", message);
                onResults(message);
            };

            future.onReply = message => onResults(message);
            future.onStdin = message => onResults(message);
        }
    }

    destroy() {
        log.info("WSKernel: destroying jupyter-js-services Session");
        this.session.dispose();
    }
}

