import fetch, { Response } from 'node-fetch'
import { createLogger } from 'bunyan'
import { KernelBase, ResultsCallback } from './kernel'
import { IKernelSpecs, ICodeCell, IExecuteResultOutput } from 'common/lib/types'

const log = createLogger({ name: 'Zeppelin' })

export type IMsgData = {
    type: string
    data: string
}
export type IMsg = ISuccessMsg | IErrorMsg
export type ISuccessMsg = {
    code: 'SUCCESS';
    msg: IMsgData[]
}
export type IErrorMsg = {
    code: 'ERROR';
    msg: IMsgData[]
}

export interface IZeppelinKernel {
    noteId: string
    paragraphId: string
    kernels(): Promise<IKernelSpecs>
    execute(cell: ICodeCell, onResults: ResultsCallback): void
}

/* -------------------------------------------------------------------------- */
/*                              zeppelin rest api                             */
/* -------------------------------------------------------------------------- */
namespace Api {
    export const listInterpreter = () => {
        return '/api/interpreter'
    }

    export const listNote = () => {
        return '/api/notebook'
    }
    export const createNote = () => {
        return '/api/notebook'
    }
    export const deleteNote = (noteId: string) => {
        return '/api/notebook/' + noteId
    }

    export const createParagraph = (noteId: string) => {
        return '/api/notebook/' + noteId + '/paragraph'
    }
    export const updateParagraph = (noteId: string, paragraphId: string) => {
        return '/api/notebook/' + noteId + '/paragraph/' + paragraphId
    }
    export const runParagraph = (noteId: string, paragraphId: string) => {
        return '/api/notebook/run/' + noteId + '/' + paragraphId
    }
}

/* -------------------------------------------------------------------------- */
/*                           zeppelin fetch request                           */
/* -------------------------------------------------------------------------- */
export class ZeppelinKernel extends KernelBase implements IZeppelinKernel {
    name = 'Zeppelin'
    noteId: string = ''
    paragraphId: string = ''

    private server: string
    private port: string
    private url: string

    constructor(server: string = `${process.env.ZEPPELIN_PROTOCOL}://${process.env.ZEPPELIN_HOST}` as string, port: string = process.env.ZEPPELIN_PORT as string) {
        super()
        this.server = server
        this.port = port
        this.url = this.server + ':' + this.port
    }

    private async sendMsg(method: string, url: string, msg?: Object) {
        if (method === 'GET') return fetch(url)
        let opts = { method, body: '' }
        if (!msg) return fetch(url, opts)
        opts.body = JSON.stringify(msg)
        return fetch(url, opts)
    }

    private async handleResponse(res: Response | undefined) {
        let json = await res?.json().catch(e => e && log.error(e))
        if (!res?.ok) log.error(json)
        return json.body ?? ''
    }

    async init() {
        this.deleteAllNote()
        this.noteId = await this.createNote() ?? ''
        this.paragraphId = await this.createParagraph(this.noteId, '')
        return this
    }

    private async listInterpreter() {
        let res = await this.sendMsg('GET', this.url + Api.listInterpreter())
        return this.handleResponse(res)
    }

    private async createNote(name?: string) {
        let res = await this.sendMsg('POST', this.url + Api.createNote(), { name: name ?? '' })
        return await this.handleResponse(res)
    }

    private async listNote() {
        let res = await this.sendMsg('GET', this.url + Api.listNote())
        return this.handleResponse(res)
    }

    private async deleteAllNote() {
        let noteList = await this.listNote()
        noteList.forEach((note: { id: string, name: string }) => {
            this.deleteNote(note.id)
        });
    }

    private async deleteNote(noteId: string) {
        let res = await this.sendMsg('DELETE', this.url + Api.deleteNote(noteId))
        return await this.handleResponse(res)
    }

    private async createParagraph(noteId: string, text: string) {
        let res = await this.sendMsg('POST', this.url + Api.createParagraph(noteId), { title: '', text })
        return this.handleResponse(res)
    }

    private async updateParagraph(noteId: string, paragraphId: string, text: string) {
        let res = await this.sendMsg('PUT', this.url + Api.updateParagraph(noteId, paragraphId), { title: '', text })
        return this.handleResponse(res)
    }

    private async runParagraph(noteId: string, paragraphId: string) {
        let res = await this.sendMsg('POST', this.url + Api.runParagraph(noteId, paragraphId))
        return this.handleResponse(res)
    }

    private isSuccessMsg(msg: IMsg) {
        return msg.code === 'SUCCESS'
    }

    private isErrorMsg(msg: IMsg) {
        return msg.code === 'ERROR'
    }

    private isTextData(data: IMsgData) {
        return data.type === 'TEXT'
    }

    private isHTMLData(data: IMsgData) {
        return data.type === 'HTML'
    }

    private handleMIME(result: IMsgData) {
        if (this.isTextData(result)) {
            return {
                type: 'text/plain',
                data: result.data
            }
        } else if (this.isHTMLData(result)) {
            return {
                type: 'text/html',
                data: result.data
            }
        } else {
            return {
                type: 'unknown',
                data: result.data
            }
        }
    }

    private handleResultData(msg: IMsg, success: boolean) {
        // success: if message code is 'SUCCESS'
        let results = msg.msg
        let dataMap: { [key: string]: string } = {}
        let dataList = results.map(result => {
            return this.handleMIME(result)
        })
        dataList.forEach(data => {
            if (data.type in dataMap) {
                dataMap[data.type] += `\n${data.data}`
            } else {
                dataMap[data.type] = data.data
            }
        })
        let executeResultOutput: IExecuteResultOutput = {
            type: 'result',
            data: dataMap
        }
        return executeResultOutput
    }

    private handleResult(msg: IMsg) {
        if (this.isSuccessMsg(msg)) {
            return this.handleResultData(msg, true)
        } else if (this.isErrorMsg(msg)) {
            return this.handleResultData(msg, false)
        } else {
            log.warn(`Unknown message ${msg.code}`);
            return undefined
        }
    }

    async kernels() {
        let interpreters = await this.listInterpreter()
        let kernels = []
        for (const val of Object.values(interpreters)) {
            let { name: displayName, id: language, id: name } = val as any
            kernels.push({ displayName, language, name, backend: this.name })
        }
        return kernels
    }

    async runningKernels() {
        // todo
    }

    async shutdownAllKernel() {
        // todo
    }

    async execute(cell: ICodeCell, onResults: ResultsCallback) {
        let { source } = cell
        source = `%${cell.language}\n${source}`
        await this.updateParagraph(this.noteId, this.paragraphId, source)
        let res: IMsg = await this.runParagraph(this.noteId, this.paragraphId)
        console.log("execute -> res", res)

        if (res) {
            let reply = this.handleResult(res)
            reply && onResults(reply)
        }
    }
}