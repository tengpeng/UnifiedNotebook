import { ICellState, ICell, ICellViewModel, CellType } from './types'
import { v4 as uuid } from 'uuid'

export const createEmptyCell = (id?: string): ICell => {
    let emptyCell = {
        id: id ?? uuid(),
        type: CellType.CODE,
        source: '',
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

export const createCellVM = (emptyCell: ICell): ICellViewModel => {
    let emptyCellVM = {
        cell: emptyCell
    }
    return emptyCellVM
}

export const createEmptyCellVM = (id?: string): ICellViewModel => {
    let emptyCell = createEmptyCell(id)
    let emptyCellVM = createCellVM(emptyCell)
    return emptyCellVM
}