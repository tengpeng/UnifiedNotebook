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
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                }, {
                    id: 'a53f768a-1858-4f03-86f6-09c10a1a0f5c',
                    type: CellType.CODE,
                    source: "// javascript get token example\n\nfs = require('fs')\n\ndata = fs.readFileSync(path.resolve(__dirname, './config.json'))\n\nconsole.log(JSON.parse(data.toString()).token)",
                    language: 'javascript',
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: '9ef575ed-7882-4233-829a-fbbd58eee0e1',
                    type: CellType.CODE,
                    source: "import pandas as pd\npd.options.display.html.table_schema = True # Data Explorer On!\npd.options.display.max_rows = 4\ndf = pd.read_csv('https://gist.githubusercontent.com/rgbkrk/a7984a8788a73e2afb8fd4b89c8ec6de/raw/db8d1db9f878ed448c3cac3eb3c9c0dc5e80891e/2015.csv')\ndf",
                    language: 'python',
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: '386bce8a-47e0-4f25-8bd4-04cc0a129ccb',
                    type: CellType.CODE,
                    source: "# JSON example\n\nfrom IPython.display import JSON\n\nJSON({'a': [1, 2, 3, 4,], 'b': {'inner1': 'helloworld', 'inner2': 'foobar'}})",
                    language: 'python',
                    backend: 'Jupyter',
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
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: '0daedc21-1578-4381-87f1-ade64e869983',
                    type: CellType.CODE,
                    source: "# error example \n\n This will throw an error",
                    language: 'python',
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: 'a4b70e5a-b8a2-454f-b7fc-ef5953873798',
                    type: CellType.CODE,
                    source: "# display example\n\nfrom IPython.display import display, Image, SVG, Math, YouTubeVideo\n\nImage(url='https://www.python.org/static/favicon.ico')",
                    language: 'python',
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: 'f4018a1b-c3ab-4e24-aac7-9f381ff32cb5',
                    type: CellType.CODE,
                    source: "# zeppelin markdown example\n\nIt will show html generated by zeppelin",
                    language: 'md',
                    backend: 'Zeppelin',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished,
                },
                {
                    id: 'de449b13-0074-4c93-a455-687a222dc454',
                    type: CellType.CODE,
                    source: '// spark example\n\nval textFile = spark.read.textFile("README.md")\nvar c = textFile.count()\nvar first = textFile.first()',
                    language: 'spark',
                    backend: 'Zeppelin',
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
                    backend: 'Jupyter',
                    metadata: {
                        scrollbar: false,
                        source_hidden: false,
                        output_hidden: false
                    },
                    outputs: [],
                    state: ICellState.Finished
                },
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

    const shutDownAllKernels = () => {
        client.emit('kernel.shutdown.all')
    }

    return (
        <div>
            <button onClick={loadExampleNotebook}>load example notebook</button>
            <button onClick={() => {
                client.emit('nb.ping')
            }}>ping</button>
            <button onClick={shutDownAllKernels}>shutdown all kernels</button>
            {/* <a download="notebookJSON.json" href={'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.getState(), null, 2))}>download</a> */}
        </div>
    )
}

const mapStateToProps = (state: IState) => state

export default connect(mapStateToProps)(Toolbar)