import React, { useState, useEffect } from "react";
import Header from "./components/header";
import Cell from "./components/cell";
import io from "socket.io-client";
import { ICellViewModel } from './types'
import { v4 as uuid } from 'uuid'
import { Message } from './Message'
import cloneDeep from 'lodash/cloneDeep'
import { createEmptyCell, createCellVM } from './common'

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
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(cellVMList)
    let cellIndex = newCellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    // socketio
    socket?.emit('session:runcell', cellVM.cell.data.source)
    socket?.on('session:runcell:success', (msg: any) => {
      message.handleIOPub(msg, newCellVM.cell)
      console.log("TCL: App -> runCell -> newCellVM", newCellVM)
      newCellVMList.splice(cellIndex, 1, newCellVM)
      setCellVMList([...newCellVMList])
    })
  }

  const clearOutput = (cellVM: ICellViewModel) => {
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(cellVMList)
    let cellIndex = newCellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    console.log("TCL: App -> runCell -> cellIndex", cellIndex)
    newCellVM.cell.data.outputs = []

    newCellVMList.splice(cellIndex, 1, newCellVM)
    setCellVMList([...newCellVMList])
  }

  const onAddCell = () => {
    setCellVMList([...cellVMList, { cell: createEmptyCell(uuid(), null) }])
  };

  const onAddCellBelow = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    let index = cellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    newCellVMList.splice(index + 1, 0, { cell: createEmptyCell(uuid(), null) })
    setCellVMList([...newCellVMList])
  }

  const onDeleteCell = (cellVM: ICellViewModel) => {
    let newCellVMList = cloneDeep(cellVMList)
    let index = cellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    newCellVMList.splice(index, 1)
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
              <Cell cellVM={cellVM} onDeleteCell={onDeleteCell} onChange={onChange} onRunCell={runCell} onClearOutput={clearOutput} onAddCellBelow={onAddCellBelow} />
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