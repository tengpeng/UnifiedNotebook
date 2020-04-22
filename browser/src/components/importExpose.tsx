import React, { useState } from 'react'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { IExposedMapMetaDataValue, IExposePayload, CellType, ICellViewModel, INotebookViewModel, IKernelSpecs } from 'common/lib/types'
import client from '../socket'

interface Props extends IState {
    cellVM: ICellViewModel
    notebookVM: INotebookViewModel
    kernels: IKernelSpecs
}

const RenderImportExposedVar: React.FC<Props> = ({ cellVM, exposedMapMetaData }) => {
    const [exposeVar, setExposeVar] = useState('')
    const [selectedImportVar, setSelectedImportVar] = useState(JSON.stringify({ id: '', variable: '' }))
    const [variableRename, setVariableRename] = useState('temp_var')

    const onExposeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
            if (cellVM.cell.type !== CellType.CODE) return
            let payload: IExposePayload = { variable: exposeVar, cell: cellVM.cell }
            client.emit('expose.variable', payload)
        }
    }

    const onExposeVar = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        setExposeVar(val)
    }

    const onImportSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let { id, payload } = (JSON.parse(selectedImportVar) as IExposedMapMetaDataValue)
        if (e.keyCode === 13) {
            if (cellVM.cell.type !== CellType.CODE) return
            if (!selectedImportVar) return
            if (id === cellVM.cell.id) return
            if (!id || !payload.variable) return
            payload.variableRename = variableRename
            payload.cellImport = cellVM.cell
            console.log("onImportSubmit -> onImportSubmit", [id, payload])
            client.emit('expose.variable.import', { id, payload })
        }
    }

    const getExposedMapMetaDataList = (): IExposedMapMetaDataValue[] => {
        let exposedMapMetaDataList = []
        for (const [id, value] of Object.entries(exposedMapMetaData)) {
            let obj = { id, payload: value.payload }
            exposedMapMetaDataList.push(obj)
        }
        return exposedMapMetaDataList
    }

    const shouldRender = () => {
        // import exposed var from any cell
        let flag = false
        let exposedMapMetaDataList = getExposedMapMetaDataList()
        console.log("shouldRender -> exposedMapMetaDataList", exposedMapMetaDataList)
        if (exposedMapMetaDataList.length) flag = true
        return flag
    }

    const renderExpose = () => {
        return (<>
            {/* export */}
            <div>
                <span> expose var: </span>
                <input type="text" value={exposeVar} placeholder="The variable to expose" onKeyDown={(e) => { onExposeSubmit(e) }} onChange={(e) => { onExposeVar(e) }} />
                <span> exposed var:  </span>
                {cellVM.exposed}
            </div>
        </>)
    }

    const renderImport = () => {
        return (<>
            {/* import */}
            <div>
                <span>import var: </span>
                <select value={selectedImportVar} onChange={(e) => { setSelectedImportVar(e.target.value) }}>
                    <option key="-1" label="The variable to import" value={JSON.stringify({ id: '', payload: {} })}></option>
                    {getExposedMapMetaDataList().map((item, index) => (
                        <option key={index} label={`${item.payload.variable}-${item.id}`} value={JSON.stringify(item)}></option>
                    ))}
                </select>
                <span> as </span>
                <input type="text" value={variableRename} onChange={(e) => { setVariableRename(e.target.value) }} placeholder="Rename variable" onKeyDown={(e) => { onImportSubmit(e) }} />
            </div>
        </>)
    }

    return ((<>
        {renderExpose()}
        {shouldRender() ? renderImport() : null}</>))
}

export default connect((state: IState) => state)(RenderImportExposedVar)
