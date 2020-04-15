import React from 'react'
import * as hljs from 'highlight.js';
import 'highlight.js/styles/github.css'
import { ICellViewModel, ParagraphResults, ParagraphIResultsMsgItem, DatasetType } from "../types"
import { default as AnsiUp } from 'ansi_up';

interface IProps {
    cellVM: ICellViewModel
}

export class CellOutputZeppelin extends React.Component<IProps> {
    results: ParagraphResults | undefined
    datasetType: DatasetType | undefined

    renderHTML(output: ParagraphIResultsMsgItem) {
        const div = document.createElement('div');
        div.innerHTML = output.data;
        const codeEle: HTMLElement | null = div.querySelector('pre code');
        if (codeEle) {
            hljs.highlightBlock(codeEle);
        }
        return <div dangerouslySetInnerHTML={{ __html: div.innerHTML }}></div>
    }

    renderText(output: ParagraphIResultsMsgItem) {
        const ansiUp = new AnsiUp();
        let res = ansiUp.ansi_to_html(output.data)
        return <div><pre>{res}</pre></div>
    }

    renderImg(output: ParagraphIResultsMsgItem) {
        let imgData = `data:image/png;base64,${output.data}`;
        return <div><img src={imgData} /></div>
    }

    renderDefaultDisplay(output: ParagraphIResultsMsgItem) {
        switch (output.type) {
            // case DatasetType.TABLE:
            //     this.renderGraph();
            //     break;
            case DatasetType.TEXT:
                return this.renderText(output);
            case DatasetType.HTML:
                return this.renderHTML(output);
            case DatasetType.IMG:
                return this.renderImg(output);
            // case DatasetType.ANGULAR:
            //     this.renderAngular();
            //     break;
        }
    }

    render() {
        let outputs = this.props.cellVM.cell.data.outputs
        if (outputs) {
            return <div>
                {(outputs as []).map((output, index) => {
                    return <div key={index}>{this.renderDefaultDisplay(output)}</div>
                })}
            </div>
        } else {
            return null
        }
    }
}