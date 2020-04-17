import React from 'react'
import { ICellViewModel } from 'common/lib/types.js'
import Cell from './Cell'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import Toolbar from './Toolbar'

const Notebook: React.FC<IState> = (props) => {
    const getContent = () => {
        return props.notebookVM.notebook.cells.map(
            (cellVM: ICellViewModel) => {
                return <Cell key={cellVM.cell.id} cellVM={cellVM} />
            })
    }
    return (
        <>
            <Toolbar />
            {getContent()}
        </>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Notebook)