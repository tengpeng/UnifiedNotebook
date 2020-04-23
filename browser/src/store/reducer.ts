import cloneDeep from 'lodash/cloneDeep'
import { INotebookViewModel, IKernelSpecs, ICellViewModel, IExposedVarMap } from 'common/lib/types'
import { createEmptyCodeCellVM } from './utils'

type IAction = {
    type: string,
    payload?: any
}
export type IState = {
    notebookVM: INotebookViewModel
    kernels: IKernelSpecs
    exposedVarMap: IExposedVarMap
}

const initialState: IState = {
    notebookVM: {
        notebook: {
            cells: [createEmptyCodeCellVM()]
        }
    },
    kernels: [],
    exposedVarMap: {}
}

export const notebookReducer = (state = initialState, action: IAction) => {
    let _ = cloneDeep(state)
    let index: number
    switch (action.type) {
        // notebook
        case 'updateNotebook':
            _.notebookVM.notebook = action.payload.notebook
            return _
        case 'clearAllOutputs':
            _.notebookVM.notebook.cells.forEach(cell => cell.cell.outputs = [])
            return _
        // cell
        case 'addCell':
            _.notebookVM.notebook.cells.push(createEmptyCodeCellVM())
            return _
        case 'updateCell':
            index = _.notebookVM.notebook.cells.findIndex(cell => cell.cell.id === action.payload.id)
            _.notebookVM.notebook.cells.splice(index, 1, { cell: action.payload, exposed: '' })
            return _
        case 'updateCells':
            _.notebookVM.notebook.cells = action.payload
            return _
        // cellVM
        case 'updateCellVM':
            index = _.notebookVM.notebook.cells.findIndex(cell => cell.cell.id === (action.payload as ICellViewModel).cell.id)
            _.notebookVM.notebook.cells.splice(index, 1, action.payload)
            return _
        // kernel
        case 'updateKernels':
            _.kernels = action.payload
            return _
        // exposed
        case 'uploadExposedVarMap':
            _.exposedVarMap = action.payload
            return _
        default:
            return state
    }
}
