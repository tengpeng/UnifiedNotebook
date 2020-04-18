import { createEmptyCodeCellVM } from '../common'
import cloneDeep from 'lodash/cloneDeep'
import { INotebookViewModel } from 'common/lib/types.js'
import { Socket } from '../socket'

type IAction = {
    type: string,
    payload?: any
}
export type IState = {
    connection: {
        socket: Socket | undefined
    }

    notebookVM: INotebookViewModel
}

const initialState: IState = {
    connection: {
        socket: undefined
    },

    notebookVM: {
        notebook: {
            cells: [createEmptyCodeCellVM()]
        }
    }
}

export const notebookReducer = (state = initialState, action: IAction) => {
    if (action.type === 'addCell') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook.cells.push(createEmptyCodeCellVM())
        return _
    } else if (action.type === 'updateNotebook') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook = action.payload.notebook
        return _
    } else if (action.type === 'updateCells') {
        let _ = cloneDeep(state)
        _.notebookVM.notebook.cells = action.payload
        return _
    } else if (action.type === 'socket') {
        let _ = cloneDeep(state)
        _.connection.socket = action.payload
        return _
    } else {
        return state
    }
}