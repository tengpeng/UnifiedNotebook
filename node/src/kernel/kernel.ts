import { IExposedVarMapValue, ICellOutput, ICodeCell, IKernelSpecs, IExposeVarPayload, IExposeVarOutput } from 'common/lib/types'

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
    interrupt(cell: ICodeCell): void
    exposeVar(payload: IExposeVarPayload): Promise<IExposeVarOutput>
    importVar(payload: IExposedVarMapValue): Promise<boolean>
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
    interrupt(cell: ICodeCell): void {
        throw new Error("Method not implemented.");
    }
    exposeVar(payload: IExposeVarPayload): Promise<IExposeVarOutput> {
        throw new Error("Method not implemented.");
    }
    importVar(payload: IExposedVarMapValue): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
