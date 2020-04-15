import * as React from "react";
import { ICellViewModel, CellState, NotebookType } from '../types'
import { ICodeCell } from '@jupyterlab/nbformat'
import { CellInput } from './cellInput'
import { CellOutput } from './cellOutput'
import { CellOutputZeppelin } from './cellOutputZeppelin'
import styled from 'styled-components'

const ExecuteCount = styled.div`
display: inline-block;
color: #555;
background: #f5f5f5;
padding: 5px;
font-family: monospace;
font-size: 12px;
`
const CellStatus = styled.span`
color: #555;
font-size: 12px;
font-family: monospace;
`
const CellType = styled.span`
color: #555;
font-size: 12px;
font-family: monospace;
`

interface ICellProps {
  cellVM: ICellViewModel
  onRunCell(cellVM: ICellViewModel): void
  onChange(ev: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel): void
  onDeleteCell(cellVM: ICellViewModel): void
  onClearOutput(cellVM: ICellViewModel): void
  onAddCellBelow(cellVM: ICellViewModel): void
  onSwitchNotebook(cellVM: ICellViewModel): void
}

const Cell: React.FC<ICellProps> = (props) => {

  const getCodeCell = () => {
    return props.cellVM.cell.data as ICodeCell;
  };

  const getCell = () => {
    return props.cellVM.cell;
  };

  const isCodeCell = () => {
    return props.cellVM.cell.data.cell_type === 'code';
  };

  const isMarkdownCell = () => {
    return props.cellVM.cell.data.cell_type === 'markdown';
  };

  const hasOutput = () => {
    return getCell().state === CellState.finished || getCell().state === CellState.error || getCell().state === CellState.executing;
  };

  const renderOutput = (): JSX.Element | null => {
    if (shouldRenderOutput()) {
      if (props.cellVM.type === NotebookType.Jupyter) {
        return <CellOutput
          cellVM={props.cellVM}
        />
      } else {
        return <CellOutputZeppelin cellVM={props.cellVM} />
      }
    }
    return null;
  };

  const shouldRenderOutput = (): boolean => {
    if (isCodeCell()) {
      const cell = getCodeCell();
      // return hasOutput() && cell.outputs && !props.cellVM.hideOutput && Array.isArray(cell.outputs) && cell.outputs.length !== 0;
      return hasOutput() && cell.outputs && Array.isArray(cell.outputs) && cell.outputs.length !== 0;
    } else if (isMarkdownCell()) {
      // todo
      // return !isShowingMarkdownEditor();
    }
    return false;
  }

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.keyCode === 13 && ev.ctrlKey) {
      props.onRunCell(props.cellVM)
    }
  }

  const getToolbar = () => (
    <>
      <button onClick={() => { props.onRunCell(props.cellVM) }}><i className="fas fa-play"></i></button>
      <button onClick={() => { props.onDeleteCell(props.cellVM) }}><i className="fas fa-times-circle"></i></button>
      <button onClick={() => { props.onClearOutput(props.cellVM) }}><i className="fas fa-eraser"></i></button>
      <button onClick={() => { props.onAddCellBelow(props.cellVM) }}><i className="fas fa-plus"></i></button>
      <button onClick={() => { props.onSwitchNotebook(props.cellVM) }}><i className="fas fa-book"></i></button>
    </>
  )

  return (
    <div>
      <ExecuteCount>[{props.cellVM.cell.data.execution_count ?? '-'}]</ExecuteCount>
      <CellType>{NotebookType[props.cellVM.type]}</CellType>
      <span> </span>
      <CellStatus>{CellState[props.cellVM.cell.state].toUpperCase()}</CellStatus>
      <CellInput cellVM={props.cellVM} onKeyDown={onKeyDown} onCodeChange={(ev) => props.onChange(ev, props.cellVM)} />
      <br />
      {getToolbar()}
      {renderOutput()}
    </div>
  )
}

export default Cell