import React from "react";
import Notebook from './components/Notebook'
import { Provider } from 'react-redux'
import { store } from './store'

const App: React.FC = () => {
  return (
    <div className="App" >
      <Provider store={store}>
        <Notebook />
      </Provider>
    </div >
  )
}

export default App
