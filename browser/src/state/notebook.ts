import { createEmptyCell, createCellVM } from '../common'
import { ICellViewModel } from '../types'
import { v4 as uuid } from 'uuid'

/* -------------------------------------------------------------------------- */
/*                                    types                                   */
/* -------------------------------------------------------------------------- */
export type NotebookAction = {
    type: string
    payload?: any
}
export type NotebookState = {
    connection: boolean
    socket: SocketIOClient.Socket | undefined,
    cellVMList: ICellViewModel[]
}

/* -------------------------------------------------------------------------- */
/*                                    state                                   */
/* -------------------------------------------------------------------------- */
export const notebookState: NotebookState = {
    // session
    connection: false,
    socket: undefined,
    // cellVMList
    cellVMList: [createCellVM(createEmptyCell(uuid()))]
}

/* -------------------------------------------------------------------------- */
/*                                   actions                                  */
/* -------------------------------------------------------------------------- */
export const notebookActions = {
    setSocket: 'SET_SOCKET',
    setConnection: 'SET_CONNECTION',

    setCellVMList: 'SET_CELL_VM_LIST'
}

/* -------------------------------------------------------------------------- */
/*                                   reducer                                  */
/* -------------------------------------------------------------------------- */
export const notebookReducer = (state: NotebookState, action: NotebookAction) => {
    switch (action.type) {
        case notebookActions.setSocket:
            return {
                ...state,
                socket: action.payload
            }
        case notebookActions.setConnection:
            return {
                ...state,
                connection: action.payload
            }
        case notebookActions.setCellVMList:
            return {
                ...state,
                cellVMList: action.payload
            }
        default:
            return state
    }
}
