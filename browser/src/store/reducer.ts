import { createEmptyCodeCellVM } from '../common'
import cloneDeep from 'lodash/cloneDeep'
import { INotebookViewModel, IKernel, IKernels } from 'common/lib/types'

type IAction = {
    type: string,
    payload?: any
}
export type IState = {
    notebookVM: INotebookViewModel
    kernels: IKernels
}

const initialState: IState = {
    notebookVM: {
        notebook: {
            cells: [createEmptyCodeCellVM()]
        }
    },
    kernels: []
}

export const notebookReducer = (state = initialState, action: IAction) => {
    let _ = cloneDeep(state)
    switch (action.type) {
        // notebook
        case 'updateNotebook':
            _.notebookVM.notebook = action.payload.notebook
            return _
        // cell
        case 'addCell':
            _.notebookVM.notebook.cells.push(createEmptyCodeCellVM())
            return _
        case 'updateCell':
            let index = _.notebookVM.notebook.cells.findIndex(cell => cell.cell.id === action.payload.id)
            _.notebookVM.notebook.cells.splice(index, 1, { cell: action.payload })
            return _
        case 'updateCells':
            _.notebookVM.notebook.cells = action.payload
            return _
        // kernel
        case 'updateKernels':
            _.kernels = action.payload
            console.log("notebookReducer -> action.payload", action.payload)
            return _
        default:
            return state
    }
}