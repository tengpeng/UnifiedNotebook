import { IKernelBase, ResultsCallback } from './kernel/kernel'
import { IKernelSpecs, ICodeCell, IExposePayload, IExposeOutput, IExposedMapMetaDataValue, IExposedMapValue } from 'common/lib/types'

interface IBackendManager {
    kernels(): Promise<IKernelSpecs>
    register(kernel: IKernelBase): void
    getBackend(name: string): IKernelBase
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    expose(payload: IExposePayload): Promise<IExposeOutput>
    import(payload: IExposedMapMetaDataValue, importJSONData: IExposedMapValue): Promise<boolean>
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
    async expose(payload: IExposePayload) {
        return this.getBackend(payload.cell.backend).expose(payload)
    }

    // import variable
    async import(payload: IExposedMapMetaDataValue, exposedMapValue: IExposedMapValue) {
        return this.getBackend(payload.payload.cell.backend).import(payload, exposedMapValue)
    }
}