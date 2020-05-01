import React from 'react'
import { ICellViewModel, INotebookViewModel, ICellState, CellType, IKernelSpecs, isParameterCell } from 'common/lib/types.js'
import { Output } from './output'
import { Input } from './input'
import cloneDeep from 'lodash/cloneDeep'
import { store } from '../store'
import { IState } from '../store/reducer'
import { connect } from 'react-redux'
import client from '../socket'
import ImportExpose from './import-expose'
import { getNotebookKernels } from '../store/utils'

interface Props extends IState {
    cellVM: ICellViewModel
    notebookVM: INotebookViewModel
    kernels: IKernelSpecs
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
                {kernels.map((kernel, index: number) => <option key={index} value={JSON.stringify({ name: kernel.name, backend: kernel.backend })}>{kernel.displayName}</option>)}
            </select>
            <span> run: </span>
            <button onClick={() => { runCell() }}>run cell</button>
            <button onClick={() => { interruptCell() }}>interrupt cell</button>
            <span> type: </span>
            <button onClick={() => { onChangeCellType(CellType.MARKDOWN) }}>markdown</button>
            <button onClick={() => { onChangeCellType(CellType.CODE) }}>code</button>
            <button onClick={() => { onChangeCellType(CellType.PARAMETER) }}>parameter(py)</button>
            <span> output: </span>
            <button onClick={() => { onClearCellOutput() }}>clear</button>
            <br />
            <ImportExpose cellVM={cellVM} />
        </>
    }

    const renderInput = () => {
        return <Input cellVM={cellVM} onKeyDown={onKeyDown} onInputChange={onInputChange} />
    }

    const onAddCell = () => {
        store.dispatch({ type: 'addCell' })
    }

    const onClearCellOutput = () => {
        let newCellVM = cloneDeep(cellVM)
        newCellVM.cell.outputs = []
        store.dispatch({ type: 'updateCellVM', payload: newCellVM })
    }

    const onChangeCellType = (type: CellType) => {
        let newCell = cloneDeep(cellVM.cell)
        newCell.type = type
        store.dispatch({ type: 'updateCell', payload: newCell })
    }

    const onChangeCellLanguage = (args: string) => {
        console.log("onChangeCellLanguage -> languageWithBackend", args)
        let languageWithBackend = JSON.parse(args)
        let newCellVMList = copyCellVMList()
        let index = findCellVMIndex(cellVM)
        newCellVMList[index].cell.language = languageWithBackend.name
        newCellVMList[index].cell.backend = languageWithBackend.backend
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

    const interruptCell = () => {
        client.emit('cell.interrupt', cellVM.cell)
    }

    const runCell = () => {
        if (isParameterCell(cellVM.cell)) {
            let kernels = getNotebookKernels(notebookVM)
            client.emit('cell.run', cellVM.cell, kernels)
        } else {
            client.emit('cell.run', cellVM.cell)
        }
    }

    const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>, cellVM: ICellViewModel) => {
        let newCellVM = cloneDeep(cellVM)
        newCellVM.cell.source = event.target.value
        store.dispatch({ type: 'updateCellVM', payload: newCellVM })
    }

    const renderBottomToolbar = () => {
        return (<>
            <button onClick={onAddCell}>add</button>
        </>)
    }

    return (
        <>
            {renderToolbar()}
            <br />
            {renderInput()}
            <br />
            {shouldRenderOutput() ? <Output cellVM={cellVM} /> : null}
            {renderBottomToolbar()}
        </>
    )
}

export default connect((state: IState) => state)(Cell)
