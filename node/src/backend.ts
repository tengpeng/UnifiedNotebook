import { IKernelBase, ResultsCallback } from './kernel/kernel'
import { IKernelSpecs, ICodeCell, IExposePayload, IExposeOutput } from 'common/lib/types'

interface IBackendManager {
    kernels(): Promise<IKernelSpecs>
    register(kernel: IKernelBase): void
    getBackend(name: string): IKernelBase
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    expose(payload: IExposePayload): Promise<IExposeOutput>
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

    async expose(payload: IExposePayload) {
        return this.getBackend(payload.cell.backend).expose(payload)
    }
}