import React, { useEffect } from 'react'
import { ICellViewModel } from 'common/lib/types.js'
import Cell from './Cell'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import Toolbar from './Toolbar'
import { store } from '../store'
import { Socket } from '../socket'


const Notebook: React.FC<IState> = ({ connection, notebookVM }) => {

    const getContent = () => {
        return notebookVM.notebook.cells.map(
            (cellVM: ICellViewModel) => {
                return <Cell key={cellVM.cell.id} cellVM={cellVM} />
            })
    }

    useEffect(() => {
        if (!connection.socket) {
            document.title = "server connecting...";
            let socket = new Socket()
            socket.init()
            store.dispatch({ type: 'socket', payload: socket })
        } else {
            document.title = "server connected";
        }
    }, [connection])

    return (
        <>
            <Toolbar />
            {getContent()}
        </>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Notebook)