import { createLogger } from 'bunyan'
import * as path from 'path'
import * as utils from '../utils'
import { Session, KernelMessage, SessionManager, KernelManager, Kernel } from "@jupyterlab/services";
import { ISessionOptions } from '@jupyterlab/services/lib/session/session';
import { NOTEBOOK_PATH } from '../consts'

const log = createLogger({ name: 'Kernel' })

const testNotebook = path.join(NOTEBOOK_PATH, 'test1.ipynb')
const testKernelName = 'python'

type ResultsCallback = {
    (message: KernelMessage.IMessage): void
}

export interface IJupyterKernel {
    interrupt(): void
    shutdown(): void
    restart(onRestarted?: Function): void
    execute(code: string, onResults: ResultsCallback): void
    destroy(): void
}

export class JupyterKernel implements IJupyterKernel {
    session: Session.ISessionConnection | undefined
    sessionManager: SessionManager
    options: Session.ISessionOptions

    constructor() {
        this.sessionManager = new SessionManager({ kernelManager: new KernelManager() });
        this.options = {
            path: testNotebook,
            type: utils.isNotebookFile(testNotebook) ? 'notebook' : '',
            name: utils.getFileName(testNotebook),
            kernel: {
                name: testKernelName
            }
        }
    }

    async init(opts?: ISessionOptions) {
        this.session = await this.sessionManager.startNew(opts ?? this.options)
        return this
    }

    interrupt() {
        this.session?.kernel?.interrupt();
    }

    shutdown() {
        this.session?.kernel?.shutdown();
    }

    restart(onRestarted?: Function) {
        const future = this.session?.kernel?.restart();
        future && future.then(() => {
            if (onRestarted) onRestarted();
        });
    }

    execute(code: string, onResults: ResultsCallback) {
        const future = this.session?.kernel?.requestExecute({ code });
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
        this.session?.dispose();
    }
}

