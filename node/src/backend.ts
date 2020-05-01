import { IKernelBase, ResultsCallback } from './kernel/kernel'
import { IKernelSpecs, ICodeCell, IExposeVarPayload, IExposeVarOutput, IExposedVarMapValue, isParameterCell, IKernelNames } from 'common/lib/types'
import { createLogger } from 'bunyan'
import { Script, createContext } from 'vm'

const log = createLogger({ name: 'BackendManager' })

interface IBackendManager {
    kernels(): Promise<IKernelSpecs>
    register(kernel: IKernelBase): void
    getBackend(name: string): IKernelBase
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    executeParameter(cell: ICodeCell, kernels: IKernelNames): void
    interrupt(cell: ICodeCell): void
    exposeVar(payload: IExposeVarPayload): Promise<IExposeVarOutput>
    importVar(payload: IExposedVarMapValue): Promise<boolean>
}

export class BackendManager implements IBackendManager {
    backends: { [key: string]: IKernelBase } = {}

    constructor() { }

    async kernels(): Promise<IKernelSpecs> {
        let kernelList: IKernelSpecs = []
        for await (const [key, backend] of Object.entries(this.backends)) {
            let kernels = await backend.kernels()
            kernelList = [...kernelList, ...kernels]
        }
        return Array.from(new Set(kernelList))
    }

    register(kernel: IKernelBase) {
        this.backends[kernel.name] = kernel
    }

    getBackend(name: string) {
        return this.backends[name]
    }

    // translate js parameter to python code
    private translateToPython(cell: ICodeCell) {
        let code = cell.source
        const sandbox = {
            toPython: function () {
                // support string/int/float/dict/list
                let code = ''
                // variables except this function
                let variables = Object.entries(sandbox).filter(variable => (variable[0] !== 'toPython'))
                let _variables = variables.map(variable => ({
                    name: variable[0],
                    value: variable[1],
                    type: Object.prototype.toString.call(variable[1])
                }))
                // translate types
                _variables.forEach(variable => {
                    if (['[object Number]', '[object String]'].includes(variable.type)) {
                        code = code + `${variable.name} = ${variable.value}\\n`
                    } else if (['[object Object]', '[object Array]'].includes(variable.type)) {
                        code = code + `${variable.name} = ${JSON.stringify(variable.value)}\\n` // support dict/list
                    } else {
                        // ignore
                    }
                });
                return code
            }
        }
        const ctx = createContext(sandbox)
        // script
        const script = new Script(code + ';toPython()')
        return script.runInContext(ctx)
    }

    private translateToLanguage(cell: ICodeCell, kernels: IKernelNames) {
        let translatedMap: {
            [key: string]: string
        } = {}
        for (const kernelName of Object.values(kernels)) {
            // translate language
            if (['python', 'python3'].includes(kernelName)) {
                translatedMap[kernelName] = this.translateToPython(cell)
            } else {
                // todo
            }
        }
        return translatedMap
    }

    // execute
    async execute(cell: ICodeCell, onResults: ResultsCallback) {
        let backend = this.getBackend(cell.backend)
        let finished = await backend.execute(cell, onResults)
        return finished
    }

    // execute parameter
    async executeParameter(cell: ICodeCell, kernels: IKernelNames) {
        // * Only support javascript to python parameter cell currently
        // todo Get all backends and call executeParameter function
        // todo run cell in every running kernel
        // todo Translate parameter code string to each language based on kernels
        let translatedMap = this.translateToLanguage(cell, kernels)
        console.log("BackendManager -> executeParameter -> translatedMap", translatedMap)
    }

    // interrupt
    async interrupt(cell: ICodeCell) {
        let backend = this.getBackend(cell.backend)
        await backend.interrupt(cell)
    }

    // expose variable
    async exposeVar(exposeVarPayload: IExposeVarPayload) {
        return await this.getBackend(exposeVarPayload.exposeCell.backend).exposeVar(exposeVarPayload)
    }

    // import variable
    async importVar(exposedMapValue: IExposedVarMapValue) {
        log.info("exposedMapValue: ", exposedMapValue)
        let importCell = exposedMapValue.payload.importCell
        if (!importCell) return false
        return await this.getBackend(importCell.backend).importVar(exposedMapValue)
    }
}