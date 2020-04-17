import * as path from 'path'

export const isNotebookFile = (pathStr: string): boolean => {
    return path.extname(pathStr) === '.ipynb' ? true : false
}
export const getFileName = (pathStr: string): string => {
    return path.basename(pathStr)
}