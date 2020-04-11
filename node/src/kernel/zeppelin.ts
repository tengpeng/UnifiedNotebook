import fetch, { Response } from 'node-fetch'
import { createLogger } from 'bunyan'

const log = createLogger({ name: 'Zeppelin' })

export interface IZeppelinKernel {
    noteId: string
    createNote(name?: string): any
    deleteNote(noteId: string): any
    createParagraph(paragraphId: string, text: string): any
    deleteAllNote(): any
    runParagraph(noteId: string, paragraphId: string): any
}

/* -------------------------------------------------------------------------- */
/*                              zeppelin rest api                             */
/* -------------------------------------------------------------------------- */
namespace Api {

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
    export const runParagraph = (noteId: string, paragraphId: string) => {
        return '/api/notebook/run/' + noteId + '/' + paragraphId
    }
}

/* -------------------------------------------------------------------------- */
/*                           zeppelin fetch request                           */
/* -------------------------------------------------------------------------- */
export class ZeppelinKernel implements IZeppelinKernel {
    private server: string
    private port: string
    private url: string
    noteId: string = ''

    constructor(server: string = `${process.env.ZEPPELIN_PROTOCOL}://${process.env.ZEPPELIN_HOST}` as string, port: string = process.env.ZEPPELIN_PORT as string) {
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

    async createNote(name?: string) {
        let res = await this.sendMsg('POST', this.url + Api.createNote(), { name: name ?? '' })
        return await this.handleResponse(res)
    }

    async init() {
        this.deleteAllNote()
        this.noteId = await this.createNote() ?? ''
        return this
    }

    async deleteNote(noteId: string) {
        let res = await this.sendMsg('DELETE', this.url + Api.deleteNote(noteId))
        return await this.handleResponse(res)
    }

    async createParagraph(paragraphId: string, text: string) {
        let res = await this.sendMsg('POST', this.url + Api.createParagraph(paragraphId), { title: '', text })
        return this.handleResponse(res)
    }

    async runParagraph(noteId: string, paragraphId: string) {
        let res = await this.sendMsg('POST', this.url + Api.runParagraph(noteId, paragraphId))
        return this.handleResponse(res)
    }

    async listNote() {
        let res = await this.sendMsg('GET', this.url + Api.listNote())
        return this.handleResponse(res)
    }

    async deleteAllNote() {
        let noteList = await this.listNote()
        noteList.forEach((note: { id: string, name: string }) => {
            this.deleteNote(note.id)
        });
    }
}