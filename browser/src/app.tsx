import io from "socket.io-client";
import React, { useState, useEffect, useReducer } from "react";
import { v4 as uuid } from 'uuid'
import Header from "./components/header";
import Cell from "./components/cell";
import { ICellViewModel, NotebookType } from './types'
import { JupyterMessage } from './message/Jupyter'
import cloneDeep from 'lodash/cloneDeep'
import { createEmptyCell } from './common'
import { SpellResult } from './utils/spell-result'
import { notebookReducer, notebookState, notebookActions } from './state/notebook'

const App: React.FC = () => {
  const [jupyterMessage] = useState(new JupyterMessage())
  const [state, dispatch] = useReducer(notebookReducer, notebookState)

  useEffect(() => {
    if (!state.connection) {
      document.title = "server connecting...";
      createSession()
    }
  }, [state.connection])

  function createSession() {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    dispatch({ type: notebookActions.setSocket, payload: socket })

    socket.on('socketID', (id: string) => {
      console.log("TCL: App -> socketID", id)
      document.title = "server connected";
      dispatch({ type: notebookActions.setConnection, payload: true })
    })
  }

  const runCell = (cellVM: ICellViewModel) => {
    // check if should continue
    let flag = true
    flag = onBeforeRunCell(cellVM)
    if (!flag) return

    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(state.cellVMList)
    // celltype
    if (cellVM.type === NotebookType.Jupyter) {
      state.socket?.emit('session:runcell', cellVM.cell.data.source)
      state.socket?.removeAllListeners()
      state.socket?.on('session:runcell:success', (msg: any) => {
        jupyterMessage.handleIOPub(msg, newCellVM.cell)
        newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
        dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
      })
    } else {
      state.socket?.emit('session:runcell:zeppelin', cellVM.cell.data.source)
      state.socket?.removeAllListeners()
      state.socket?.on('session:runcell:zeppelin:success', (msg: any) => {
        console.log("runCell -> msg", msg)
        // todo
      })
    }
  }

  const switchNotebookType = (cellVM: ICellViewModel) => {
    // check if zeppelin or jupyter
    let magic = SpellResult.extractMagic(cellVM.cell.data.source as string)
    if (magic && cellVM.type === NotebookType.Jupyter) {
      return NotebookType.Zeppelin
    } if (!magic && cellVM.type === NotebookType.Zeppelin) {
      return NotebookType.Jupyter
    } else {
      return undefined
    }
  }

  const onBeforeRunCell = (cellVM: ICellViewModel): boolean => {
    // check if should continue
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(state.cellVMList)

    let res = switchNotebookType(cellVM)
    console.log("onBeforeRunCell -> res", res)
    if (res) {
      newCellVM.type = res
      newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
      dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
      return false
    }
    return true
  }

  const clearOutput = (cellVM: ICellViewModel) => {
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(state.cellVMList)
    newCellVM.cell.data.outputs = []

    newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
    dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
  }

  const onAddCell = () => {
    dispatch({ type: notebookActions.setCellVMList, payload: [...state.cellVMList, { cell: createEmptyCell(uuid(), null), type: NotebookType.Jupyter }] })
  };

  const onAddCellBelow = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(state.cellVMList)
    newCellVMList.splice(findCellIndex(cellVM) + 1, 0, { cell: createEmptyCell(uuid(), null), type: NotebookType.Jupyter })
    dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
  }

  const findCellIndex = (cellVM: ICellViewModel) => {
    return state.cellVMList.findIndex((cellVMItem: ICellViewModel) => cellVMItem.cell.id === cellVM.cell.id)
  }

  const onDeleteCell = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(state.cellVMList)
    newCellVMList.splice(findCellIndex(cellVM), 1)
    dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
  };

  const onSessionRestart = () => {
    if (state.socket) {
      state.socket.emit('session:restart')
      dispatch({ type: notebookActions.setConnection, payload: false })
      state.socket.on('session:restart:success', () => {
        console.log('restarted')
        dispatch({ type: notebookActions.setConnection, payload: true })
      })
    }
  }

  const onSwitchNotebook = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(state.cellVMList)
    let newCellVM = cloneDeep(cellVM)
    if (newCellVM.type === NotebookType.Jupyter) {
      newCellVM.type = NotebookType.Zeppelin
    } else {
      newCellVM.type = NotebookType.Jupyter
    }
    newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
    dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
  }

  const onChange = (ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(state.cellVMList)
    newCellVMList.forEach((cellVMItem: ICellViewModel, index: number) => {
      if (cellVMItem.cell.id === cellVM.cell.id) {
        cellVMItem.cell.data.source = ev.target.value
      }
    });
    dispatch({ type: notebookActions.setCellVMList, payload: [...newCellVMList] })
  }

  const getContent = () => {
    return (
      <div>
        {state.cellVMList.map((cellVM: ICellViewModel, index: number) => {
          return (
            <div key={index}>
              <Cell cellVM={cellVM} onDeleteCell={onDeleteCell} onChange={onChange} onRunCell={runCell} onClearOutput={clearOutput} onAddCellBelow={onAddCellBelow} onSwitchNotebook={onSwitchNotebook} />
            </div>
          );
        })}
        <br />
      </div>
    )
  };

  return (
    <div className="App" >
      <Header onAddCell={onAddCell} onSessionRestart={onSessionRestart} />
      <br />
      {state.connection ? (
        getContent()
      ) : (
          <div>loading...</div>
        )}
    </div >
  )
}

export default App