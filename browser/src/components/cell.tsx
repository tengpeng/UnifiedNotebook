import React from 'react'
import { ICellViewModel, INotebookViewModel, ICellState, CellType, IKernel } from 'common/lib/types.js'
import { Output } from './output'
import { Input } from './input'
import cloneDeep from 'lodash/cloneDeep'
import { store } from '../store'
import { IState } from '../store/reducer'
import { connect } from 'react-redux'
import client from '../socket'

interface Props extends IState {
    cellVM: ICellViewModel
    notebookVM: INotebookViewModel
}

const Cell: React.FC<Props> = ({ cellVM, notebookVM, kernels }) => {
    const shouldRenderOutput = () => {
        return Boolean(cellVM.cell.outputs.length) || cellVM.cell.type === CellType.MARKDOWN
    }

    const renderToolbar = () => {
        return <>
            <div>
                <span>language: {kernels.find(kernel => kernel.name === cellVM.cell.language)?.displayName}</span>
                <span> | </span>
                <span>state: {ICellState[cellVM.cell.state]}</span>
                <span> | </span>
                <span>id: <input type="text" style={{ width: '250px' }} defaultValue={cellVM.cell.id} /></span>
            </div>
            <span> language: </span>
            <select name="" id="" onChange={e => { onChangeCellLanguage(e.target.value) }}>
                {kernels.map((kernel: IKernel, index: number) => <option key={index} value={kernel.name}>{kernel.displayName}</option>)}
            </select>
            <span> run: </span>
            <button onClick={() => { runCell() }}>run cell</button>
            <span> type: </span>
            <button onClick={() => { onChangeCellType(CellType.MARKDOWN) }}>markdown</button>
            <button onClick={() => { onChangeCellType(CellType.CODE) }}>code</button>
        </>
    }

    const renderInput = () => {
        return <Input cellVM={cellVM} onKeyDown={onKeyDown} onInputChange={onInputChange} />
    }

    const onAddCell = () => {
        store.dispatch({ type: 'addCell' })
    }

    const onChangeCellType = (type: CellType) => {
        let newCell = cloneDeep(cellVM.cell)
        newCell.type = type
        store.dispatch({ type: 'updateCell', payload: newCell })
    }

    const onChangeCellLanguage = (language: string) => {
        console.log("onChangeCellLanguage -> language", language)
        let newCellVMList = copyCellVMList()
        let index = findCellVMIndex(cellVM)
        newCellVMList[index].cell.language = language
        store.dispatch({ type: 'updateCells', payload: newCellVMList })
    }

    const getCellVMList = () => {
        return notebookVM.notebook.cells
    }

    const copyCellVMList = () => {
        return cloneDeep(getCellVMList())
    }

    const findCellVMIndex = (cellVM: ICellViewModel) => {
        let cellVMList = getCellVMList()
        let index = cellVMList.findIndex((item: ICellViewModel) => item.cell.id === cellVM.cell.id)
        return index
    }

    const onKeyDown = (ev: React.KeyboardEvent) => {
        if (ev.keyCode === 13 && ev.ctrlKey) {
            runCell()
        }
    }

    const runCell = () => {
        client.emit('cell.run', cellVM.cell)
    }

    const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) => {
        let index = findCellVMIndex(cellVM)
        let newCellVMList = copyCellVMList()
        newCellVMList[index].cell.source = event.target.value
        store.dispatch({ type: 'updateCells', payload: newCellVMList })
    }

    const renderOutput = () => {
        return (
            <><Output cellVM={cellVM} /></>
        )
    }

    return (
        <>
            {renderToolbar()}
            <br />
            {renderInput()}
            <br />
            {shouldRenderOutput() ? renderOutput() : null}
            <button onClick={onAddCell}>add</button>
        </>
    )
}

export default connect((state: IState) => state)(Cell)