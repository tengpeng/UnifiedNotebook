import React from 'react'
import { ICellViewModel, INotebookViewModel } from 'common/lib/types.js'
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

const Cell: React.FC<Props> = ({ cellVM, notebookVM }) => {
    const shouldRenderOutput = () => {
        return Boolean(cellVM.cell.outputs.length)
    }

    const renderToolbar = () => {
        return <>
            <div>
                <span>language: {cellVM.cell.language}</span>
            </div>
            <button onClick={() => { onChangeCellLanguage('python') }}>python</button>
            <button onClick={() => { onChangeCellLanguage('sh') }}>sh</button>
            <button onClick={() => { runCell() }}>run cell</button>
        </>
    }

    const renderInput = () => {
        return <Input cellVM={cellVM} onKeyDown={onKeyDown} onInputChange={onInputChange} />
    }

    const onAddCell = () => {
        store.dispatch({ type: 'addCell' })
    }

    const onChangeCellLanguage = (language: string) => {
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