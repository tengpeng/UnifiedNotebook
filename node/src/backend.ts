import { IKernelBase, ResultsCallback } from './kernel/kernel'
import { IKernelSpecs, ICodeCell, IExposeVarPayload, IExposeVarOutput, IExposedVarMapValue } from 'common/lib/types'
import { createLogger } from 'bunyan'

const log = createLogger({ name: 'BackendManager' })

interface IBackendManager {
    kernels(): Promise<IKernelSpecs>
    register(kernel: IKernelBase): void
    getBackend(name: string): IKernelBase
    execute(cell: ICodeCell, onResults: ResultsCallback): void
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

    execute(cell: ICodeCell, onResults: ResultsCallback) {
        let backend = this.getBackend(cell.backend)
        backend.execute(cell, onResults)
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