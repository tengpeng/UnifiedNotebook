import { IKernelBase, ResultsCallback } from './kernel/kernel'
import { IKernelSpecs, ICodeCell, IExposeVarPayload, IExposeVarOutput, IExposedVarMapValue, IKernelInfo } from 'common/lib/types'
import { createLogger } from 'bunyan'
import { Script, createContext } from 'vm'
import { createEmptyCodeCell } from 'common/lib/utils'

const log = createLogger({ name: 'BackendManager' })

type ITranslatedMap = {
    [key: string]: {
        code: string,
        backend: string,
        language: string
    }
}

interface IBackendManager {
    kernels(): Promise<IKernelSpecs>
    register(kernel: IKernelBase): void
    getBackend(name: string): IKernelBase
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    executeParameter(cell: ICodeCell, kernelInfo: IKernelInfo): Promise<Boolean>
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
                        code = code + `${variable.name} = "${variable.value}";`
                    } else if (['[object Object]', '[object Array]'].includes(variable.type)) {
                        code = code + `${variable.name} = ${JSON.stringify(variable.value)};` // support dict/list
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

    private translateToLanguage(cell: ICodeCell, kernelInfo: IKernelInfo) {
        log.info('Translate to language')
        let translatedMap: ITranslatedMap = {}
        for (const info of Object.values(kernelInfo)) {
            // translate language
            if (['python3'].includes(info.language)) {
                translatedMap[info.language] = {
                    code: this.translateToPython(cell),
                    backend: info.backend,
                    language: info.language
                }
            } else {
                // todo
            }
        }
        log.info('Translate to language finished', translatedMap)
        return translatedMap
    }

    // execute
    async execute(cell: ICodeCell, onResults: ResultsCallback) {
        let backend = this.getBackend(cell.backend)
        let finished = await backend.execute(cell, onResults)
        return finished
    }

    // execute parameter
    async executeParameter(cell: ICodeCell, kernelInfo: IKernelInfo): Promise<Boolean> {
        log.info('Execute parameter')
        // * Only support javascript to python parameter cell currently
        // * Get all backends and call executeParameter function
        // * run cell in every running kernel
        // todo Translate parameter code string to each language based on kernelInfo
        let translatedMap = this.translateToLanguage(cell, kernelInfo)
        console.log("BackendManager -> executeParameter -> translatedMap", translatedMap)
        let promises = []
        for (const translated of Object.values(translatedMap)) {
            let _cell = createEmptyCodeCell()
            _cell.backend = translated.backend
            _cell.language = translated.language
            _cell.source = translated.code
            promises.push(await this.execute(_cell, res => { console.log(res) }))
        }
        let res = await Promise.all(promises)
        return res.every(Boolean)
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