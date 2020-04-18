import React from "react";
import Notebook from './components/notebook'
import { Provider } from 'react-redux'
import { store } from './store'

const App: React.FC = () => {
  return (
    <div className="App" >
      <Provider store={store}>
        <Notebook />
      </Provider>
    </div>
  )
}

export default App
