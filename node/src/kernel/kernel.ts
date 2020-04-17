import { ICellOutput, IStreamOutput, ICellOutputType } from 'common/lib/types.js'

// results callback
interface ResultsCallback {
    (output: ICellOutputType): void;
}

// kernel
interface Kernel {
    init(): Kernel;
    execute(code: string, onResults: ResultsCallback): void;
    restart(onRestart: Function): void;
}
