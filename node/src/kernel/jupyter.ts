import * as path from 'path'
import * as utils from '../utils/notebook'
import { createLogger } from 'bunyan'
import { Session, SessionManager, KernelMessage, KernelManager } from "@jupyterlab/services";
import { ISessionOptions } from '@jupyterlab/services/lib/session/session';
import { NOTEBOOK_PATH } from '../consts'
import { KernelBase, ResultsCallback } from './kernel'
import { IExecuteResultOutput, IMimeBundle, IStreamOutput, IDiaplayOutput, IClearOutput, IErrorOutput, IStatusOutput, ICellState } from 'common/lib/types'
import { formatStreamText, concatMultilineStringOutput } from '../utils/common'

const log = createLogger({ name: 'Kernel' })

const testNotebook = path.join(NOTEBOOK_PATH, 'test1.ipynb')
const testKernelName = 'python'

export interface IJupyterKernel {
    restart(onRestarted?: Function): void
    execute(code: string, onResults: ResultsCallback): void
}

export class JupyterKernel extends KernelBase implements IJupyterKernel {
    session: Session.ISessionConnection | undefined
    sessionManager: SessionManager
    options: Session.ISessionOptions

    constructor() {
        super()
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

    restart(onRestarted?: Function) {
        const future = this.session?.kernel?.restart();
        future && future.then(() => {
            if (onRestarted) onRestarted();
        });
    }

    private handleResult(msg: KernelMessage.IIOPubMessage) {
        try {
            // todo status message
            if (KernelMessage.isExecuteResultMsg(msg)) {
                return this.handleExecuteResult(msg as KernelMessage.IExecuteResultMsg);
            } else if (KernelMessage.isStreamMsg(msg)) {
                return this.handleStreamMesssage(msg as KernelMessage.IStreamMsg);
            } else if (KernelMessage.isDisplayDataMsg(msg)) {
                return this.handleDisplayData(msg as KernelMessage.IDisplayDataMsg);
            } else if (KernelMessage.isClearOutputMsg(msg)) {
                return this.handleClearOutput(msg as KernelMessage.IClearOutputMsg);
            } else if (KernelMessage.isStatusMsg(msg)) {
                return this.handleStatusMessage(msg as KernelMessage.IStatusMsg);
            } else if (KernelMessage.isErrorMsg(msg)) {
                return this.handleError(msg as KernelMessage.IErrorMsg);
            } else {
                log.warn(`Unknown message ${msg.header.msg_type} : hasData=${'data' in msg.content}`);
            }
        } catch (err) {
            log.error("JupyterMessage -> handleIOPub -> err", err)
        }
    }

    private handleExecuteResult(msg: KernelMessage.IExecuteResultMsg): IExecuteResultOutput {
        return {
            type: "result",
            data: msg.content.data as IMimeBundle
        }
    }

    private handleStreamMesssage(msg: KernelMessage.IStreamMsg): IStreamOutput {
        return {
            type: 'stream',
            name: msg.content.name,
            text: formatStreamText(concatMultilineStringOutput(msg.content.text))
        }
    }

    private handleDisplayData(msg: KernelMessage.IDisplayDataMsg): IDiaplayOutput {
        return {
            type: 'display',
            data: msg.content.data as IMimeBundle
        };
    }

    private handleClearOutput(msg: KernelMessage.IClearOutputMsg): IClearOutput {
        return {
            type: 'clear'
        }
    }

    private handleError(msg: KernelMessage.IErrorMsg): IErrorOutput {
        // todo different from zeppelin
        return {
            type: 'error',
            ename: msg.content.ename,
            evalue: msg.content.evalue,
            traceback: msg.content.traceback
        };
    }

    private handleStatusMessage(msg: KernelMessage.IStatusMsg): IStatusOutput {
        let state
        if (msg.content.execution_state === 'idle') {
            state = ICellState.Finished
        } else if (msg.content.execution_state === 'busy') {
            state = ICellState.Running
        } else {
            state = ICellState.Error
        }
        return {
            type: 'status',
            state
        }
    }

    execute(code: string, onResults: ResultsCallback) {
        const future = this.session?.kernel?.requestExecute({ code });
        if (future) {
            future.onIOPub = message => {
                let reply = this.handleResult(message)
                reply && onResults(reply);
            };
            // todo other message
            // future.onReply = message => {
            //     let reply = this.handleResult(message)
            //     reply && onResults(reply)
            // };
            // future.onStdin = message => {
            //     let reply = this.handleResult(message)
            //     reply && onResults(reply)
            // };
        }
    }
}
