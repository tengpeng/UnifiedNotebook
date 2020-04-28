import { INotebookJSON, INotebookCallback, ICell, isExecuteResultOutput, isStatusOutput, isStreamOutput, IResponse, ICellOutput, IExecuteResultOutput, IStatusOutput, IStreamOutput, isErrorOutput, IErrorOutput, isClearOutput, IClearOutput } from 'common/lib/types'
import jsonfile from 'jsonfile'
import path from 'path'
import { createLogger } from 'bunyan'
import { BackendManager } from './backend'
import cloneDeep from 'lodash/cloneDeep'

const log = createLogger({ name: 'NotebookManager' })

export interface INotebookManager {
    loadNotebook(url: string): Promise<INotebookJSON | void>
    loadNotebookJSON(notebook: INotebookJSON): Promise<void>
    runNotebook(notebookCallback: INotebookCallback, silent: boolean): Promise<boolean>
}

export class NotebookManager implements INotebookManager {
    notebookJson: INotebookJSON | undefined
    backendManager: BackendManager

    constructor(backendManager: BackendManager) {
        this.backendManager = backendManager
    }

    private handleRunCellSuccess(res: IResponse) {
        let msg: ICellOutput = res.msg
        let cell: ICell = res.cell
        if (isExecuteResultOutput(msg)) {
            this.handleExecuteResult(msg as IExecuteResultOutput, cell)
        } else if (isStatusOutput(msg)) {
            // handleStatusOutput(msg as IStatusOutput, cell)
        } else if (isStreamOutput(msg)) {
            this.handleStreamOutput(msg as IStreamOutput, cell)
        } else if (isErrorOutput(msg)) {
            // handleErrorOutput(msg as IErrorOutput, cell)
        } else if (isClearOutput(msg)) {
            // handleClearOutput(msg as IClearOutput, cell)
        } else {
            console.warn(`Unknown message ${msg.type} : called by cell ${cell.id}`);
        }
    }

    private handleExecuteResult(msg: IExecuteResultOutput, cell: ICell) {
        cell.outputs = [msg]
    }

    private handleStreamOutput(msg: IStreamOutput, cell: ICell) {
        cell.outputs.push(msg)
    }

    // read notebook json file
    async loadNotebook(url: string) {
        log.info('Load notebook')
        let jsonData = await File.read(url).catch(err => {
            log.error(err)
        })
        // todo verify notebook json data
        // this.verify(jsonData)
        if (jsonData) { this.notebookJson = jsonData as INotebookJSON }
        return jsonData
    }

    // parse notebook json file
    async loadNotebookJSON(notebook: INotebookJSON) {
        log.info('Load notebook json')
        // todo verify notebook json data
        // this.verify(notebook)
        this.notebookJson = notebook as INotebookJSON
    }

    // run notebook in silent mode
    async runNotebook(notebookCallback: INotebookCallback, silent: boolean = true) {
        log.info('Run notebook json')
        if (!this.notebookJson) return false
        let cells = this.notebookJson.cells
        let length = cells.length
        let finish = false
        log.info('Notebook cell length: ', length)
        for (let [index, cell] of Object.entries(cells)) {
            await this.backendManager.execute(cell, (output: ICellOutput) => {
                if (silent) {
                    // ignore
                } else {
                    this.handleRunCellSuccess({ msg: output, cell })
                }
            })
            log.info(`Executing cell: ${Number(index) + 1} / ${length}`)
            notebookCallback({ current: Number(index), length, finish })
        }
        finish = true
        notebookCallback({ current: length - 1, length, finish })
        log.info(`Executing finished`)
        log.info(`Notebook cells: `, cells)
        return true
    }
}

namespace File {
    export const read = (url: string): Promise<INotebookJSON> => {
        return new Promise((res, rej) => {
            let absUrl = path.resolve(__dirname, url)
            log.info("Read notebook: ", absUrl)
            jsonfile.readFile(absUrl, (err, data) => {
                if (err) {
                    rej(err)
                } else {
                    res(data)
                }
            })
        })

    }
}