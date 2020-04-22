import { IExposedMapValue, IExposedMapMetaDataValue, ICellOutput, ICodeCell, IKernelSpecs, IExposeOutput, IExposePayload } from 'common/lib/types'

// results callback
export interface ResultsCallback {
    (output: ICellOutput): void;
}

// kernel
export interface IKernelBase {
    name: string
    init(): void
    kernels(): Promise<IKernelSpecs>
    runningKernels(): void
    shutdownAllKernel(): void
    execute(cell: ICodeCell, onResults: ResultsCallback): void
    expose(payload: IExposePayload): Promise<IExposeOutput>
    import(payload: IExposedMapMetaDataValue, importJSONData: IExposedMapValue): Promise<boolean>
}

export class KernelBase implements IKernelBase {
    name = 'Name not implemented.'
    kernels(): Promise<IKernelSpecs> {
        throw new Error("Method not implemented.");
    }
    runningKernels(): void {
        throw new Error("Method not implemented.");
    }
    shutdownAllKernel(): void {
        throw new Error("Method not implemented.");
    }
    init() {
        throw new Error("Method not implemented.");
    }
    execute(cell: ICodeCell, onResults: ResultsCallback): void {
        throw new Error("Method not implemented.");
    }
    expose(payload: IExposePayload): Promise<IExposeOutput> {
        throw new Error("Method not implemented.");
    }
    import(payload: IExposedMapMetaDataValue, importJSONData: IExposedMapValue): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
