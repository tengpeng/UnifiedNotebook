import { ICell, INotebookViewModel } from 'common/lib/types'
import { ICellState, ICodeCell, ICellViewModel, CellType } from 'common/lib/types'
import { v4 as uuid } from 'uuid'
import { store } from './index'
import cloneDeep from 'lodash/cloneDeep'

/* -------------------------------------------------------------------------- */
/*                                   cellVM                                   */
/* -------------------------------------------------------------------------- */
export const getCurrentCellVM = (cell: ICell) => {
    let state = store.getState()
    let currentCells = state.notebookVM.notebook.cells
    let index = currentCells.findIndex(item => item.cell.id === cell.id)
    return currentCells[index]
}

export const cloneCurrentCellVM = (cell: ICell) => {
    return cloneDeep(getCurrentCellVM(cell))
}

// create cell
export const createEmptyCodeCell = (id?: string): ICodeCell => {
    let emptyCell = {
        id: id ?? uuid(),
        type: CellType.CODE,
        source: '',
        language: 'python3', // todo testing select python3 by default
        backend: 'Jupyter',
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
        cell: emptyCell,
        exposed: ''
    }
    return emptyCellVM
}

export const createEmptyCodeCellVM = (id?: string): ICellViewModel => {
    let emptyCell = createEmptyCodeCell(id)
    let emptyCellVM = createCellVM(emptyCell)
    return emptyCellVM
}

/* -------------------------------------------------------------------------- */
/*                                 notebookVM                                 */
/* -------------------------------------------------------------------------- */
export const cloneNotebookVM = (notebookVM: INotebookViewModel) => {
    return cloneDeep(notebookVM)
}