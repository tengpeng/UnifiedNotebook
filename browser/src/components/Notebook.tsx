import React from 'react'
import { ICellViewModel } from 'common/lib/types.js'
import Cell from './cell'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import Toolbar from './toolbar'

const Notebook: React.FC<IState> = ({ notebookVM }) => {

    const getContent = () => {
        return notebookVM.notebook.cells.map(
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