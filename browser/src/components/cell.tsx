import React from 'react'
import { ICellViewModel, INotebookViewModel } from '../types'
import { Output } from './Output'
import { Input } from './Input'
import cloneDeep from 'lodash/cloneDeep'
import { store } from '../store'
import { IState } from '../store/reducer'
import { connect } from 'react-redux'

interface Props {
    cellVM: ICellViewModel
    notebookVM: INotebookViewModel
}

const Cell: React.FC<Props> = ({ cellVM, notebookVM }) => {
    const shouldRenderOutput = () => {
        return Boolean(cellVM.cell.outputs.length)
    }

    const renderInput = () => {
        return <Input cellVM={cellVM} onKeyDown={onKeyDown} onInputChange={onInputChange} />
    }

    const onAddCell = () => {
        store.dispatch({ type: 'addCell' })
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
        // todo
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
            <div>{JSON.stringify(cellVM)}</div>
            {renderInput()}
            <br />
            {shouldRenderOutput() ? renderOutput() : null}
            <button onClick={onAddCell}>add</button>
        </>
    )
}

export default connect((state: IState) => state)(Cell)