import { INotebookJSON } from 'common/lib/types'
import jsonfile from 'jsonfile'
import path from 'path'
import { createLogger } from 'bunyan'
import { BackendManager } from './backend'

const log = createLogger({ name: 'NotebookManager' })

interface INotebookManager {
    loadNotebook(url: string): Promise<INotebookJSON | void>
    runNotebook(): Promise<boolean>
}

class NotebookManager implements INotebookManager {
    notebookJson: INotebookJSON | undefined
    backendManager: BackendManager

    constructor(backendManager: BackendManager) {
        this.backendManager = backendManager
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

    // run notebook in silent mode
    async runNotebook(silent: boolean = true) {
        if (!this.notebookJson) return false
        if (silent) {
            let cells = this.notebookJson.cells
            let length = cells.length
            for (let i = 0; i < length; i++) {
                await this.backendManager.execute(cells[i], () => {
                    log.info(`Executing cell: ${i} / length`)
                })
            }
            log.info(`Executing finished`)
        } else {
            // todo write output to json data
        }
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