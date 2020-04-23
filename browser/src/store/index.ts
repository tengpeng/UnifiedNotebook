import { createStore } from 'redux'
import { notebookReducer } from './reducer'

export const store = createStore(notebookReducer)
