import React from "react";
import { useEffect, useState } from "react";
import Header from "./components/header";
import Cell from "./components/cell";
import Toolbar from "./components/toolbar";
import io from "socket.io-client";
import { Identifiers } from './constants'
import { CellState, ICell, ICellViewModel } from './types'
import { v4 as uuid } from 'uuid'

/**
 * Copied from https://github.com/microsoft/vscode-python/blob/61b179b2092050709e3c373a6738abad8ce581c4/src/datascience-ui/interactive-common/mainState.ts 
 */
const createEmptyCell = (id: string | undefined, executionCount: number | null = 1): ICell => {
  return {
    data: {
      cell_type: 'code',
      execution_count: executionCount,
      metadata: {},
      outputs: [],
      source: ''
    },
    id: id ? id : Identifiers.EditCellId,
    file: Identifiers.EmptyFileName,
    line: 0,
    state: CellState.finished
  };
}
export function createCellVM(inputCell: ICell): ICellViewModel {
  const vm = {
    cell: inputCell
  };
  return vm;
}

export default function App() {
  const [connection, setConnection] = useState(false);
  const [cellVMList, setCellVMList] = useState([createCellVM(createEmptyCell(uuid()))]);

  useEffect(() => {
    connection || createSession()
  });

  function createSession() {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    socket.on('socketID', (id: string) => {
      console.log("TCL: App -> socketID", id)
      socket.emit('session:start')
      document.title = "kernel connecting...";
    })
    socket.on('session:start:success', () => {
      document.title = "kernel connected";
      setConnection(true);
    })
  }

  function onAddCell() {
    let newCellVMList = JSON.parse(JSON.stringify(cellVMList));
    newCellVMList.push({ cell: createEmptyCell(uuid(), null) });
    setCellVMList(newCellVMList);
  };

  const onChange = (ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) => {
    let newCellVMList = JSON.parse(JSON.stringify(cellVMList));
    newCellVMList.forEach((cellVMItem: ICellViewModel) => {
      if (cellVMItem.cell.id === cellVM.cell.id) {
        cellVMItem.cell.data.source = ev.target.value
      }
    });
    setCellVMList(newCellVMList);
  }

  const getContent = () => (
    <div>
      {cellVMList.map((cellVM: ICellViewModel) => {
        return (
          <div key={cellVM.cell.id}>
            <Cell cellVM={cellVM} onChange={onChange} />
          </div>
        );
      })}
      <br />
      <Toolbar onAddCell={onAddCell} />
    </div>
  );

  return (
    <div className="App">
      <Header />
      <br />
      {connection ? (
        getContent()
      ) : (
          <div>loading...</div>
        )}
    </div>
  );
}
