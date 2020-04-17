import { ICellOutput } from 'common/lib/types.js'

// results callback
export interface ResultsCallback {
    (output: ICellOutput): void;
}

// kernel
export interface IKernelBase {
    init(): void;
    execute(code: string, onResults: ResultsCallback): void;
    restart(onRestart: Function): void;
}

export class KernelBase implements IKernelBase {
    init() {
        throw new Error("Method not implemented.");
    }
    execute(code: string, onResults: ResultsCallback): void {
        throw new Error("Method not implemented.");
    }
    restart(onRestart: Function): void {
        throw new Error("Method not implemented.");
    }
}
