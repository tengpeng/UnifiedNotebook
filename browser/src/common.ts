import { Identifiers } from './constants'
import { CellState, ICell, ICellViewModel } from './types'

/**
 * Copied from https://github.com/microsoft/vscode-python/blob/61b179b2092050709e3c373a6738abad8ce581c4/src/datascience-ui/interactive-common/mainState.ts 
 */
export const createEmptyCell = (id: string | undefined, executionCount: number | null = 1): ICell => {
    return {
        data: {
            cell_type: 'code',
            execution_count: executionCount,
            metadata: {},
            outputs: [],
            source: ''
        },
        id: id ? id : Identifiers.EditCellId,
        file: Identifiers.EmptyFileName,
        line: 0,
        state: CellState.finished
    };
}

export const createCellVM = (inputCell: ICell): ICellViewModel => {
    const vm = {
        cell: inputCell
    };
    return vm;
}