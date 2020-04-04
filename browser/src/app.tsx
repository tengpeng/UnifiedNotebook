import React from "react";
import Header from "./components/header";
import Cell from "./components/cell";
import Toolbar from "./components/toolbar";
import io from "socket.io-client";
import { Identifiers } from './constants'
import { CellState, ICell, ICellViewModel } from './types'
import { v4 as uuid } from 'uuid'
import { Message } from './Message'
import cloneDeep from 'lodash/cloneDeep'

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

export default class App extends React.Component {
  state: {
    connection: boolean,
    cellVMList: ICellViewModel[]
  }
  private message: Message

  constructor(props: any) {
    super(props)
    this.state = {
      connection: false,
      cellVMList: [createCellVM(createEmptyCell(uuid()))]
    }
    this.message = new Message()
  }

  componentDidMount() {
    if (!this.state.connection) {
      this.createSession()
    }
  }

  createSession() {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    socket.on('socketID', (id: string) => {
      console.log("TCL: App -> socketID", id)
      socket.emit('session:start')
      document.title = "kernel connecting...";
    })
    socket.on('session:start:success', () => {
      document.title = "kernel connected";
      this.setState({
        connection: true
      })
    })
  }

  runCell(cellVM: ICellViewModel) {
    let newCellVM = cloneDeep(cellVM)
    let newCellVMList = cloneDeep(this.state.cellVMList)
    let cellIndex = newCellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    console.log("TCL: App -> runCell -> cellIndex", cellIndex)
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    socket.emit('session:runcell', cellVM.cell.data.source)
    socket.on('session:runcell:success', (msg: any) => {
      this.message.handleIOPub(msg, newCellVM.cell)
      console.log("TCL: App -> runCell -> newCellVM", newCellVM)
      newCellVMList.splice(cellIndex, 1, newCellVM)
      this.setState({
        cellVMList: newCellVMList
      })
    })
  }

  onAddCell() {
    this.setState({
      cellVMList: [...this.state.cellVMList, { cell: createEmptyCell(uuid(), null) }]
    })
  };
  onDeleteCell(cellVM: ICellViewModel) {
    let newCellVMList = cloneDeep(this.state.cellVMList)
    let index = this.state.cellVMList.findIndex(cellVMItem => cellVMItem.cell.id === cellVM.cell.id)
    newCellVMList.splice(index, 1)
    this.setState({
      cellVMList: newCellVMList
    })
  };

  onChange(ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) {
    let newCellVMList = cloneDeep(this.state.cellVMList)
    newCellVMList.forEach((cellVMItem: ICellViewModel, index: number) => {
      if (cellVMItem.cell.id === cellVM.cell.id) {
        cellVMItem.cell.data.source = ev.target.value
      }
    });
    this.setState({
      cellVMList: newCellVMList
    })
  }

  getContent() {
    return (
      <div>
        {this.state.cellVMList.map((cellVM: ICellViewModel, index: number) => {
          return (
            <div key={index}>
              <Cell cellVM={cellVM} onDeleteCell={this.onDeleteCell.bind(this)} onChange={this.onChange.bind(this)} onRunCell={this.runCell.bind(this)} />
            </div>
          );
        })}
        <br />
        <Toolbar onAddCell={this.onAddCell.bind(this)} />
      </div>
    )
  };

  render() {
    return (
      <div className="App" >
        <Header />
        <br />
        {this.state.connection ? (
          this.getContent()
        ) : (
            <div>loading...</div>
          )}
      </div >
    )
  };
}
