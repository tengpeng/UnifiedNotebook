import React from 'react'
import { ICellState, INotebookViewModel, CellType } from 'common/lib/types.js'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { store } from '../store'
import client from '../socket'

const Toolbar: React.FC<IState> = (props) => {
    // * example notebook data
    const loadExampleNotebook = () => {
        let temp = {
            cells: [
                {
                    id: '4e698ede-c098-4d84-bbce-516d448c4f97',
                    type: CellType.CODE,
                    source: '#result example\n\n1 + 1',
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
                    id: 'e068c6bb-605c-4933-be67-b0c562eb87e2',
                    type: CellType.CODE,
                    source: "#stream example\n\nimport time\n\nprint('start')\ntime.sleep(1)\nprint('processing')\ntime.sleep(1)\nprint('processing')\ntime.sleep(1)\nprint('processing')\ntime.sleep(1)\nprint('finish')",
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
                    id: 'd55c0afd-dfb8-4e49-8139-0336c85484d0',
                    type: CellType.MARKDOWN,
                    source: "#### md math example\n\n$\\sigma_U \\sim \\mathrm{Normal}(0, \\Theta_U^2)$",
                    language: 'python',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished
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
            <button onClick={() => {
                client.emit('nb.ping')
            }}>ping</button>
        </div>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Toolbar)