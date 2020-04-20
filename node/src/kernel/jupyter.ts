import { createLogger } from 'bunyan'
import { KernelMessage, KernelAPI, KernelManager, Kernel, KernelSpecAPI } from "@jupyterlab/services";
import { ISessionOptions } from '@jupyterlab/services/lib/session/session';
import { KernelBase, ResultsCallback } from './kernel'
import { IExecuteResultOutput, IMimeBundle, IStreamOutput, IDiaplayOutput, IClearOutput, IErrorOutput, IStatusOutput, ICellState, ICodeCell } from 'common/lib/types'
import { formatStreamText, concatMultilineStringOutput } from '../utils/common'
import { ISpecModel } from '@jupyterlab/services/lib/kernelspec/restapi';

const log = createLogger({ name: 'Kernel' })

export interface IJupyterKernel {
    runningKernels(): void
    shutdownAllKernel(): void
    execute(cell: ICodeCell, onResults: ResultsCallback): void
}

export class JupyterKernel extends KernelBase implements IJupyterKernel {
    kernel: Kernel.IKernelConnection | undefined

    constructor() { super() }

    // list running kernels
    static async kernels() {
        let specs = await KernelSpecAPI.getSpecs()
        if (specs && specs.kernelspecs) {
            let kernels = []
            for (const val of Object.values(specs.kernelspecs)) {
                let { display_name: displayName, language, name } = val as ISpecModel
                kernels.push({ displayName, language, name })
            }
            return kernels
        } else {
            return []
        }
    }
    async runningKernels() {
        return KernelAPI.listRunning()
    }
    private async shutdownKernel(id: string) {
        return KernelAPI.shutdownKernel(id)
    }
    async shutdownAllKernel() {
        let kernels = await this.runningKernels()
        let promises = kernels.map(kernel => this.shutdownKernel(kernel.id))
        return Promise.all(promises)
    }
    private async isKernelRunning(name: string) {
        let kernels = await this.runningKernels()
        let runningKernel = kernels.findIndex(kernel => kernel.name === name)
        return runningKernel !== -1
    }
    private async getRunningKernel(name: string) {
        let kernels = await this.runningKernels()
        return kernels.find(kernel => kernel.name === name)
    }
    private async startNewKernel(name: string) {
        return KernelAPI.startNew({ name })
    }
    private async getKernelInfo() {
        return this.kernel?.info
    }
    private async startKernel(name: string) {
        let kernel
        if (await this.isKernelRunning(name)) {
            kernel = await this.getRunningKernel(name)
        } else {
            kernel = await this.startNewKernel(name)
        }
        return kernel
    }
    private async connectToKernel(model: KernelAPI.IModel) {
        return await new KernelManager().connectTo({ model })
    }
    async switchToKernel(name: string) {
        let kernel = await this.startKernel(name)
        if (kernel) {
            this.kernel = await this.connectToKernel(kernel)
        }
    }

    async init(opts?: ISessionOptions) {
        return this
    }

    // result handler
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
        let serializedText = formatStreamText(concatMultilineStringOutput(msg.content.text))
        return {
            type: 'stream',
            name: msg.content.name,
            text: serializedText
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

    // execute
    async execute(cell: ICodeCell, onResults: ResultsCallback) {
        console.log("JupyterKernel -> execute -> cell", cell)
        let currentKernel = await this.kernel?.info
        let currentKernelName = currentKernel?.language_info.name
        let kernelName = cell.language
        if (currentKernelName !== kernelName) {
            await this.switchToKernel(kernelName)
            let info = await this.getKernelInfo()
            console.log("JupyterKernel -> execute -> switchToKernel", info?.language_info.name)
        }

        const future = this.kernel?.requestExecute({ code: cell.source });
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
