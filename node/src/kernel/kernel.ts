import { ICellOutput, ICodeCell } from 'common/lib/types'

// results callback
export interface ResultsCallback {
    (output: ICellOutput): void;
}

// kernel
export interface IKernelBase {
    init(): void;
    runningKernels(): void
    shutdownAllKernel(): void
    execute(cell: ICodeCell, onResults: ResultsCallback): void;
}

export class KernelBase implements IKernelBase {
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
}
