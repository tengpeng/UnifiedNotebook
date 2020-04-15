/**
 * Copied from https://github.com/microsoft/vscode-python/blob/14d81c8536755da1ccca82e2c0fc59f69eb86224/src/client/datascience/jupyter/jupyterNotebook.ts
 */

import { KernelMessage } from '@jupyterlab/services'
import * as nbformat from '@jupyterlab/nbformat'
import { ICell, CellState } from '../types'
import { concatMultilineStringOutput, formatStreamText } from '../utils/common'

export class JupyterMessage {

    handleIOPub(msg: KernelMessage.IIOPubMessage, cell: ICell) {
        try {
            if (KernelMessage.isExecuteResultMsg(msg)) {
                this.handleExecuteResult(msg as KernelMessage.IExecuteResultMsg, cell as ICell);
            } else if (KernelMessage.isExecuteInputMsg(msg)) {
                this.handleExecuteInput(msg as KernelMessage.IExecuteInputMsg, cell as ICell);
            } else if (KernelMessage.isStatusMsg(msg)) {
                this.handleStatusMessage(msg as KernelMessage.IStatusMsg, cell as ICell);
            } else if (KernelMessage.isStreamMsg(msg)) {
                this.handleStreamMesssage(msg as KernelMessage.IStreamMsg, cell as ICell);
            } else if (KernelMessage.isDisplayDataMsg(msg)) {
                this.handleDisplayData(msg as KernelMessage.IDisplayDataMsg, cell as ICell);
            } else if (KernelMessage.isUpdateDisplayDataMsg(msg)) {
                this.handleUpdateDisplayData(msg as KernelMessage.IUpdateDisplayDataMsg, cell as ICell);
            } else if (KernelMessage.isClearOutputMsg(msg)) {
                this.handleClearOutput(msg as KernelMessage.IClearOutputMsg, cell as ICell);
            } else if (KernelMessage.isErrorMsg(msg)) {
                this.handleError(msg as KernelMessage.IErrorMsg, cell as ICell);
            } else {
                console.warn(`Unknown message ${msg.header.msg_type} : hasData=${'data' in msg.content}`);
            }

        } catch (err) {
            console.log("TCL: Message -> handleIOPub -> err", err)
        }
    }

    private addToCellData(cell: ICell, output: nbformat.IUnrecognizedOutput | nbformat.IExecuteResult | nbformat.IDisplayData | nbformat.IStream | nbformat.IError) {
        const data: nbformat.ICodeCell = cell.data as nbformat.ICodeCell;
        // data.outputs = [...data.outputs, output];
        data.outputs = [output]
        cell.data = data;
    }

    handleExecuteResult(msg: KernelMessage.IExecuteResultMsg, cell: ICell) {
        console.log("TCL: Message -> handleExecuteResult -> handleExecuteResult")
        this.addToCellData(cell, { output_type: 'execute_result', data: msg.content.data, metadata: msg.content.metadata, execution_count: msg.content.execution_count })
    }

    handleExecuteInput(msg: KernelMessage.IExecuteInputMsg, cell: ICell) {
        console.log("TCL: Message -> handleExecuteInput -> handleExecuteInput")
        cell.data.execution_count = msg.content.execution_count;
    }

    handleStatusMessage(msg: KernelMessage.IStatusMsg, cell: ICell) {
        console.log("TCL: Message -> handleStatusMessage -> handleStatusMessage")
        // Status change to idle generally means we finished. Not sure how to
        // make sure of this. Maybe only bother if an interrupt
        if (msg.content.execution_state === 'idle' && cell.state !== CellState.error) {
            cell.state = CellState.finished;
        } else if (msg.content.execution_state === 'busy') {
            cell.state = CellState.executing
        }
    }

    handleStreamMesssage(msg: KernelMessage.IStreamMsg, cell: ICell) {
        console.log("TCL: Message -> handleStreamMesssage -> handleStreamMesssage")
        // Might already have a stream message. If so, just add on to it.
        const data: nbformat.ICodeCell = cell.data as nbformat.ICodeCell;
        const existing = data.outputs.length > 0 && data.outputs[data.outputs.length - 1].output_type === 'stream' ? data.outputs[data.outputs.length - 1] : undefined;
        if (existing) {
            existing.text = existing.text + msg.content.text;
            existing.text = formatStreamText(concatMultilineStringOutput(existing.text))
        } else {
            // Create a new stream entry
            const output: nbformat.IStream = {
                output_type: 'stream',
                name: msg.content.name,
                text: formatStreamText(concatMultilineStringOutput(msg.content.text))
            };
            this.addToCellData(cell, output);
        }
    }

    handleDisplayData(msg: KernelMessage.IDisplayDataMsg, cell: ICell) {
        console.log("TCL: Message -> handleDisplayData -> handleDisplayData")
        const output: nbformat.IDisplayData = {
            output_type: 'display_data',
            data: msg.content.data,
            metadata: msg.content.metadata
        };
        this.addToCellData(cell, output);
    }

    handleUpdateDisplayData(msg: KernelMessage.IUpdateDisplayDataMsg, cell: ICell) {
        console.log("TCL: Message -> handleUpdateDisplayData -> handleUpdateDisplayData")
        // Should already have a display data output in our cell.
        const data: nbformat.ICodeCell = cell.data as nbformat.ICodeCell;
        const output = data.outputs.find(o => o.output_type === 'display_data');
        if (output) {
            output.data = msg.content.data;
            output.metadata = msg.content.metadata;
        }
    }

    handleClearOutput(msg: KernelMessage.IClearOutputMsg, cell: ICell) {
        console.log("TCL: Message -> handleClearOutput -> handleClearOutput")
        // Clear all outputs and start over again.
        const data: nbformat.ICodeCell = cell.data as nbformat.ICodeCell;
        data.outputs = [];
    }

    handleError(msg: KernelMessage.IErrorMsg, cell: ICell) {
        console.log("TCL: Message -> handleError -> handleError")
        const output: nbformat.IError = {
            output_type: 'error',
            ename: msg.content.ename,
            evalue: msg.content.evalue,
            traceback: msg.content.traceback
        };
        this.addToCellData(cell, output);
        cell.state = CellState.error;

        // // In the error scenario, we want to stop all other pending cells.
        // if (this.configService.getSettings().datascience.stopOnError) {
        //     this.pendingCellSubscriptions.forEach(c => {
        //         if (c.cell.id !== cell.id) {
        //             c.cancel();
        //         }
        //     });
        // }
    }

}