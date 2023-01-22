import { MainContainer } from './container/MainContainer'
import { MainProvider } from './context/MainContext'

function App () {
  return (
    <div className="w-full flex items-center justify-center flex-col py-10">
      <MainProvider>
        <MainContainer />
      </MainProvider>
    </div>
  )
}

export default App
