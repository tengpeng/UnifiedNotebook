import * as React from "react";
import { ICellViewModel, CellState } from '../types'
import { ICodeCell } from '@jupyterlab/nbformat'
import { CellInput } from './cellInput'
import { CellOutput } from './cellOutput'
import styled from 'styled-components'

const ExecuteCount = styled.div`
display: inline-block;
color: #555;
background: #f5f5f5;
padding: 5px;
font-family: monospace;
font-size: 12px;
`

interface ICellProps {
  cellVM: ICellViewModel
  onRunCell(cellVM: ICellViewModel): void
  onChange(ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
  onDeleteCell(cellVM: ICellViewModel): void
  onClearOutput(cellVM: ICellViewModel): void
}

export default class Cell extends React.Component<ICellProps> {

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

  public render() {
    return (
      <div>
        <ExecuteCount>[{this.props.cellVM.cell.data.execution_count ?? '-'}]</ExecuteCount>
        <CellInput cellVM={this.props.cellVM} onKeyDown={this.onKeyDown.bind(this)} onCodeChange={(ev) => this.props.onChange(ev, this.props.cellVM)} />
        <br />
        <button onClick={() => { this.props.onRunCell(this.props.cellVM) }}>run cell</button>
        <button onClick={() => { this.props.onDeleteCell(this.props.cellVM) }}>delete cell</button>
        <button onClick={() => { this.props.onClearOutput(this.props.cellVM) }}>clear output</button>
        {this.renderOutput()}
      </div>
    );
  }

  onKeyDown(ev: React.KeyboardEvent) {
    if (ev.keyCode === 13 && ev.ctrlKey) {
      this.props.onRunCell(this.props.cellVM)
    }
  }
}
