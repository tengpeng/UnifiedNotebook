import { createEmptyCellVM } from '../common'
import cloneDeep from 'lodash/cloneDeep'
import { INotebookViewModel } from '../types'

type IAction = {
    type: string,
    payload?: any
}
export type IState = {
    notebookVM: INotebookViewModel
}

const initialState: IState = {
    notebookVM: {
        notebook: {
            cells: [createEmptyCellVM()]
        }
    }
}

export const notebookReducer = (state = initialState, action: IAction) => {
    if (action.type === 'addCell') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook.cells.push(createEmptyCellVM())
        return _
    } else if (action.type === 'updateNotebook') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook = action.payload.notebook
        return _
    } else if (action.type === 'updateCells') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook.cells = action.payload
        return _
    } else {
        return state
    }
}