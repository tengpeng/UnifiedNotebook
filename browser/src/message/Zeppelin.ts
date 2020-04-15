import { ParagraphResults, ParagraphIResultsMsgItem, ICell, CellState, IZeppelinCell } from '../types'

/* -------------------------------------------------------------------------- */
/*                          Zeppelin Message Handler                          */
/* -------------------------------------------------------------------------- */
export class ZeppelinMessage {
    result: ParagraphIResultsMsgItem | undefined

    // todo cell as any
    handleResults(msg: ParagraphResults, cell: ICell) {
        try {
            if (msg.code === 'SUCCESS') {
                this.handleSuccessResult(cell, msg);
            } else if (msg.code === 'ERROR') {
                this.handleErrorResult(cell, msg)
            } else {
                console.warn(`Unknown message ${msg.code} : hasData=${(msg as []).length}`);
            }

        } catch (err) {
            console.log("ZeppelinMessage -> handleResults -> err", err)
        }
    }

    private addToCellData(cell: ICell, msg: ParagraphResults) {
        if (msg.msg) {
            console.log("ZeppelinMessage -> addToCellData -> addToCellData", cell, msg)
            cell.data.outputs = msg.msg
        }
    }

    private handleSuccessResult(cell: ICell, msg: ParagraphResults) {
        console.log("ZeppelinMessage -> handleSuccessResult -> msg", msg)
        cell.state = CellState.finished
        this.addToCellData(cell, msg)
    }

    private handleErrorResult(cell: ICell, msg: ParagraphResults) {
        console.log("ZeppelinMessage -> handleErrorResult -> msg", msg)
        cell.state = CellState.error
        this.addToCellData(cell, msg)
    }
}
