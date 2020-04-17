import React from 'react'
import { ICellState, INotebookViewModel, CellType } from '../types'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { store } from '../store'

const Toolbar: React.FC<IState> = (props) => {
    // * example notebook data
    const loadExampleNotebook = () => {
        let temp = {
            cells: [
                {
                    id: '4e698ede-c098-4d84-bbce-516d448c4f97',
                    type: CellType.CODE,
                    source: '1 + 1',
                    language: 'python',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: 'df62fa94-8d63-4c37-8a65-0501c09f4eba',
                    type: CellType.CODE,
                    source: '$python print("hello wolrd")',
                    language: 'python',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                }
            ]
        }
        let data: INotebookViewModel = {
            notebook: { cells: [] }
        }
        temp.cells.forEach(cellItem => {
            data.notebook.cells.push({ cell: cellItem })
        })
        console.log("loadExampleNotebook -> data", data)

        store.dispatch({ type: 'updateNotebook', payload: data })
    }

    return (
        <div>
            <button onClick={loadExampleNotebook}>load example notebook</button>
        </div>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Toolbar)