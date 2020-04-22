import { createLogger } from 'bunyan'
import { KernelMessage, KernelAPI, KernelManager, Kernel, KernelSpecAPI } from "@jupyterlab/services";
import { ISessionOptions } from '@jupyterlab/services/lib/session/session';
import { KernelBase, ResultsCallback } from './kernel'
import { IExposedMapValue, IExposedMapMetaDataValue, IExposeOutput, IExposePayload, IExecuteResultOutput, IMimeBundle, IStreamOutput, IDiaplayOutput, IClearOutput, IErrorOutput, IStatusOutput, ICellState, ICodeCell, IKernelSpecs, isExecuteResultOutput, isStreamOutput } from 'common/lib/types'
import { formatStreamText, concatMultilineStringOutput } from '../utils/common'
import { ISpecModel } from '@jupyterlab/services/lib/kernelspec/restapi';
import cloneDeep from 'lodash/cloneDeep'

const log = createLogger({ name: 'Kernel' })

export interface IJupyterKernel {
    kernels(): Promise<IKernelSpecs>
    runningKernels(): void
    shutdownAllKernel(): void
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    expose(payload: IExposePayload): Promise<IExposeOutput>
    import(payload: IExposedMapMetaDataValue, importJSONData: IExposedMapValue): Promise<boolean>
}

export class JupyterKernel extends KernelBase implements IJupyterKernel {
    name = 'Jupyter'
    kernel: Kernel.IKernelConnection | undefined

    constructor() { super() }

    // kernel handler
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
    private async switchKernelIfNeeded(cell: ICodeCell) {
        let currentKernel = await this.kernel?.info
        let currentKernelName = currentKernel?.language_info.name
        let cellKernelName = cell.language
        if (currentKernelName !== cellKernelName) {
            await this.switchToKernel(cellKernelName)
            let info = await this.getKernelInfo()
            console.log("JupyterKernel -> execute -> switchToKernel", info?.language_info.name)
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

    // repl
    private async exposeRepl(payload: IExposePayload, codeToExecute: string): Promise<string> {
        return new Promise(async (res, rej) => {
            await this.switchKernelIfNeeded(payload.cell)
            let tempCell = cloneDeep(payload.cell)
            tempCell.source = codeToExecute
            let dataString: string
            this.execute(tempCell, output => {
                console.log("JupyterKernel -> constructor -> output", output)
                if (isExecuteResultOutput(output)) {
                    dataString = ((output as IExecuteResultOutput).data as any)['text/plain']
                } if (isStreamOutput(output)) {
                    dataString = (output as IStreamOutput).text
                } else {
                    dataString = ''
                }
                // get text/plain data from the first output
                console.log("JupyterKernel -> constructor -> dataString", dataString)
                dataString && res(dataString)
            })
        })
    }

    private async importRepl(payload: IExposedMapMetaDataValue, codeToExecute: string): Promise<string> {
        return new Promise(async (res, rej) => {
            if (!payload.payload.cellImport) {
                rej() // ignore
                return
            }
            await this.switchKernelIfNeeded(payload.payload.cellImport)
            let tempCell = cloneDeep(payload.payload.cellImport)
            tempCell.source = codeToExecute
            let dataString: string
            this.execute(tempCell, output => {
                console.log("JupyterKernel -> constructor -> output", output)
                if (isExecuteResultOutput(output)) {
                    dataString = ((output as IExecuteResultOutput).data as any)['text/plain']
                } if (isStreamOutput(output)) {
                    dataString = (output as IStreamOutput).text
                } else {
                    dataString = ''
                }
                // get text/plain data from the first output
                console.log("JupyterKernel -> constructor -> dataString", dataString)
                dataString && res(dataString)
            })
        })
    }

    // execute
    async execute(cell: ICodeCell, onResults: ResultsCallback) {
        console.log("JupyterKernel -> execute -> cell")
        await this.switchKernelIfNeeded(cell)
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

    // list all kernels
    async kernels() {
        let specs = await KernelSpecAPI.getSpecs()
        if (specs && specs.kernelspecs) {
            let kernels = []
            for (const val of Object.values(specs.kernelspecs)) {
                let { display_name: displayName, language, name } = val as ISpecModel
                kernels.push({ displayName, language, name, backend: this.name })
            }
            return kernels
        } else {
            return []
        }
    }

    // expose variable
    private prepareExposeCode(payload: IExposePayload) {
        let language = payload.cell.language
        let variable = payload.variable
        let temp_variable = 'temp_unified_notebook_var'
        let code
        if (['python3', 'python'].includes(language)) {
            code = `
            import json
            ${temp_variable} = json.dumps(${variable})
            print(${temp_variable})
            del ${temp_variable}
            `
        } else if (['javascript'].includes(language)) {
            code = `
            ${temp_variable} = JSON.stringify(${variable})
            console.log(global.${temp_variable})
            delete global.${temp_variable}`
        } else {
            // todo to support other language
            code = ''
        }
        return code
    }

    // import variable
    private prepareImportCode(payload: IExposedMapMetaDataValue, exposedMapValue: IExposedMapValue) {
        let language = payload.payload.cellImport?.language ?? ''
        let variableRename = payload.payload.variableRename
        let code
        if (['python3', 'python'].includes(language)) {
            code = `
            import json
            ${variableRename} = (json.loads("${exposedMapValue.jsonData.data.trim()}"))
            print('ok')
            `
        } else if (['javascript'].includes(language)) {
            code = `
            ${variableRename} = JSON.parse('${exposedMapValue.jsonData.data.trim()}')
            console.log('ok')
            `
        } else {
            // todo to support other language
            code = ''
        }
        return code
    }

    async expose(payload: IExposePayload) {
        let codeToExecute = this.prepareExposeCode(payload)
        let output = await this.exposeRepl(payload, codeToExecute)
        let exposeOutput: IExposeOutput = {
            data: output
        }
        console.log("JupyterKernel -> expose -> exposeOutput", exposeOutput)
        return exposeOutput
    }

    async import(payload: IExposedMapMetaDataValue, exposedMapValue: IExposedMapValue) {
        let codeToExecute = this.prepareImportCode(payload, exposedMapValue)
        console.log("JupyterKernel -> import -> codeToExecute", codeToExecute)
        let output = await this.importRepl(payload, codeToExecute)
        let exposeOutput: IExposeOutput = {
            data: output
        }
        let flag = false
        if (exposeOutput.data.trim() === 'ok') {
            flag = true
        }
        console.log("JupyterKernel -> import -> flag", flag)
        return flag
    }
}
