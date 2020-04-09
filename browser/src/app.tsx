import React, { useState, useEffect } from "react";
import Header from "./components/header";
import Cell from "./components/cell";
import io from "socket.io-client";
import { ICellViewModel, NotebookType } from './types'
import { v4 as uuid } from 'uuid'
import { Message } from './Message'
import cloneDeep from 'lodash/cloneDeep'
import { createEmptyCell, createCellVM } from './common'
import { SpellResult } from './utils/spell-result'

const App: React.FC = () => {
  const [connection, setConnection] = useState(false)
  const [cellVMList, setCellVMList] = useState([createCellVM(createEmptyCell(uuid()))])
  const [message] = useState(new Message())
  const [socket, setSocket] = useState(undefined as SocketIOClient.Socket | undefined)

  useEffect(() => {
    if (!connection) {
      createSession()
    }
  }, [connection])

  function createSession() {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    setSocket(socket)

    socket.on('socketID', (id: string) => {
      console.log("TCL: App -> socketID", id)
      socket.emit('session:start')
      document.title = "kernel connecting...";
    })
    socket.on('session:start:success', () => {
      document.title = "kernel connected";
      setConnection(true)
    })
  }

  const runCell = (cellVM: ICellViewModel) => {
    // check if should continue
    let flag = true
    flag = onBeforeRunCell(cellVM)
    if (!flag) return

    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(cellVMList)
    // celltype
    if (cellVM.type === NotebookType.Jupyter) {
      socket?.emit('session:runcell', cellVM.cell.data.source)
      socket?.removeAllListeners()
      socket?.on('session:runcell:success', (msg: any) => {
        message.handleIOPub(msg, newCellVM.cell)
        newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
        setCellVMList([...newCellVMList])
      })
    } else {
      socket?.emit('session:runcell:zeppelin', cellVM.cell.data.source)
      socket?.removeAllListeners()
      socket?.on('session:runcell:zeppelin:success', (msg: any) => {
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
    let newCellVMList = cloneDeep(cellVMList)

    let res = switchNotebookType(cellVM)
    console.log("onBeforeRunCell -> res", res)
    if (res) {
      newCellVM.type = res
      newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
      setCellVMList([...newCellVMList])
      return false
    }
    return true
  }

  const clearOutput = (cellVM: ICellViewModel) => {
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(cellVMList)
    newCellVM.cell.data.outputs = []

    newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
    setCellVMList([...newCellVMList])
  }

  const onAddCell = () => {
    setCellVMList([...cellVMList, { cell: createEmptyCell(uuid(), null), type: NotebookType.Jupyter }])
  };

  const onAddCellBelow = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    newCellVMList.splice(findCellIndex(cellVM) + 1, 0, { cell: createEmptyCell(uuid(), null), type: NotebookType.Jupyter })
    setCellVMList([...newCellVMList])
  }

  const findCellIndex = (cellVM: ICellViewModel) => {
    return cellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
  }

  const onDeleteCell = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    newCellVMList.splice(findCellIndex(cellVM), 1)
    setCellVMList([...newCellVMList])
  };

  const onSessionRestart = () => {
    if (socket) {
      socket.emit('session:restart')
      setConnection(false)
      socket.on('session:restart:success', () => {
        console.log('restarted')
        setConnection(true)
      })
    }
  }

  const onSwitchNotebook = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    let newCellVM = cloneDeep(cellVM)
    if (newCellVM.type === NotebookType.Jupyter) {
      newCellVM.type = NotebookType.Zeppelin
    } else {
      newCellVM.type = NotebookType.Jupyter
    }
    newCellVMList.splice(findCellIndex(cellVM), 1, newCellVM)
    setCellVMList([...newCellVMList])
  }

  const onChange = (ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    newCellVMList.forEach((cellVMItem: ICellViewModel, index: number) => {
      if (cellVMItem.cell.id === cellVM.cell.id) {
        cellVMItem.cell.data.source = ev.target.value
      }
    });
    setCellVMList([...newCellVMList])
  }

  const getContent = () => {
    return (
      <div>
        {cellVMList.map((cellVM: ICellViewModel, index: number) => {
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
      {connection ? (
        getContent()
      ) : (
          <div>loading...</div>
        )}
    </div >
  )
}

export default App