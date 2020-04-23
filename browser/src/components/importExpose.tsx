import React, { useState } from 'react'
import { connect } from 'react-redux'
import { IState } from '../store/reducer'
import { IExposeVarPayload, IExposedVarMapValue, CellType, ICellViewModel, INotebookViewModel, IKernelSpecs } from 'common/lib/types'
import client from '../socket'

interface Props extends IState {
    cellVM: ICellViewModel
    notebookVM: INotebookViewModel
    kernels: IKernelSpecs
}

const createExposeVarPayload = (exposeVar: string, cellVM: ICellViewModel): IExposeVarPayload => {
    return {
        exposeVar: exposeVar,
        exposeCell: cellVM.cell
    }
}

const RenderImportExposedVar: React.FC<Props> = ({ cellVM, exposedVarMap }) => {
    const [exposeVar, setExposeVar] = useState('')
    const [selectedImportVar, setSelectedImportVar] = useState(JSON.stringify({}))
    const [variableRename, setVariableRename] = useState('temp_var')

    const onExposeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
            if (cellVM.cell.type !== CellType.CODE) return
            let exposeVarPayload: IExposeVarPayload = createExposeVarPayload(exposeVar, cellVM)
            client.emit('expose.variable', exposeVarPayload)
        }
    }

    const onExposeVar = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        setExposeVar(val)
    }

    const onImportSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let exposedVarMapValue = (JSON.parse(selectedImportVar) as IExposedVarMapValue)
        if (e.keyCode === 13) {
            if (cellVM.cell.type !== CellType.CODE) return
            if (!selectedImportVar) return
            if (exposedVarMapValue.id === cellVM.cell.id) return
            if (!exposedVarMapValue.id || !exposedVarMapValue.payload.exposeVar) return
            exposedVarMapValue.payload.importVarRename = variableRename
            exposedVarMapValue.payload.importCell = cellVM.cell
            console.log("onImportSubmit -> exposedVarMapValue", exposedVarMapValue)
            client.emit('expose.variable.import', exposedVarMapValue)
        }
    }

    const getExposedVarMapValueList = (): IExposedVarMapValue[] => {
        let exposedMapValueList = []
        for (const val of Object.values(exposedVarMap)) {
            exposedMapValueList.push(val)
        }
        return exposedMapValueList
    }

    const shouldDisableImport = () => {
        // import exposed var from any cell
        let flag = false
        let exposedVarMapValueList = getExposedVarMapValueList()
        if (!exposedVarMapValueList.length) flag = true
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
        let disabled = shouldDisableImport()
        return (<>
            {/* import */}
            <div>
                <span>import var: </span>
                <select disabled={disabled} value={selectedImportVar} onChange={(e) => { setSelectedImportVar(e.target.value) }}>
                    <option key="-1" label="The variable to import" value={JSON.stringify({ id: '', payload: {} })}></option>
                    {getExposedVarMapValueList().map((item, index) => (
                        <option key={index} label={`${item.payload.exposeVar}-${item.id}`} value={JSON.stringify(item)}></option>
                    ))}
                </select>
                <span> as </span>
                <input disabled={disabled} type="text" value={variableRename} onChange={(e) => { setVariableRename(e.target.value) }} placeholder="Rename variable" onKeyDown={(e) => { onImportSubmit(e) }} />
            </div>
        </>)
    }

    return ((<>
        {renderExpose()}
        {renderImport()}
    </>))
}

export default connect((state: IState) => state)(RenderImportExposedVar)
