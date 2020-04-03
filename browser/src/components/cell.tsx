import * as React from "react";
import io from "socket.io-client";
import { ICellViewModel, CellState } from '../types'
import { MultilineString, ICodeCell } from '@jupyterlab/nbformat'
import { Message } from '../Message'
import { CellInput } from './cellInput'
import { CellOutput } from './cellOutput'

interface ICellProps {
  cellVM: ICellViewModel,
  onChange(ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
}

export default class Cell extends React.Component<ICellProps> {
  private message: Message

  constructor(props: ICellProps) {
    super(props)
    this.message = new Message()
  }

  private getCodeCell = () => {
    return this.props.cellVM.cell.data as ICodeCell;
  };

  private getCell = () => {
    return this.props.cellVM.cell;
  };

  private isCodeCell = () => {
    return this.props.cellVM.cell.data.cell_type === 'code';
  };

  private isMarkdownCell = () => {
    return this.props.cellVM.cell.data.cell_type === 'markdown';
  };

  private hasOutput = () => {
    return this.getCell().state === CellState.finished || this.getCell().state === CellState.error || this.getCell().state === CellState.executing;
  };

  private renderOutput = (): JSX.Element | null => {
    if (this.shouldRenderOutput()) {
      return (
        <div>
          <CellOutput
            cellVM={this.props.cellVM}
          />
        </div>
      );
    }
    return null;
  };

  private shouldRenderOutput(): boolean {
    if (this.isCodeCell()) {
      const cell = this.getCodeCell();
      // return this.hasOutput() && cell.outputs && !this.props.cellVM.hideOutput && Array.isArray(cell.outputs) && cell.outputs.length !== 0;
      return this.hasOutput() && cell.outputs && Array.isArray(cell.outputs) && cell.outputs.length !== 0;
    } else if (this.isMarkdownCell()) {
      // todo
      // return !this.isShowingMarkdownEditor();
    }
    return false;
  }

  public runCell(value: MultilineString) {
    // socketio
    let socket = io("http://localhost:80", { reconnection: true });
    socket.emit('session:runcell', value)
    socket.on('session:runcell:success', (msg: any) => {
      console.log("TCL: runCell -> msg", msg)
      this.message.handleIOPub(msg, this.props.cellVM.cell)
    })
  }

  public render() {
    return (
      <div>
        <CellInput cellVM={this.props.cellVM} onCodeChange={(ev) => this.props.onChange(ev, this.props.cellVM)} />
        <br />
        {this.renderOutput()}
        <br />
        <button onClick={() => { this.runCell(this.props.cellVM.cell.data.source) }}>run cell</button>
      </div>
    );
  }

}

