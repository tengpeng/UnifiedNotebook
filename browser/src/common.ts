import { ICellState, ICodeCell, ICellViewModel, CellType } from './types'
import { v4 as uuid } from 'uuid'

export const createEmptyCodeCell = (id?: string): ICodeCell => {
    let emptyCell = {
        id: id ?? uuid(),
        type: CellType.CODE,
        source: '',
        language: 'python',
        metadata: {
            scrollbar: true,
            source_hidden: false,
            output_hidden: false,
        },
        state: ICellState.Finished,
        outputs: [],
    }
    return emptyCell;
}

export const createCellVM = (emptyCell: ICodeCell): ICellViewModel => {
    let emptyCellVM = {
        cell: emptyCell
    }
    return emptyCellVM
}

export const createEmptyCodeCellVM = (id?: string): ICellViewModel => {
    let emptyCell = createEmptyCodeCell(id)
    let emptyCellVM = createCellVM(emptyCell)
    return emptyCellVM
}