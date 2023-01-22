import { useContext } from 'react'

import { Dashboard } from '../components/Dashboard'
import { Menu } from '../components/Menu'

import MainContext from '../context/MainContext'

export const MainContainer = () => {
  const { step, bot } = useContext(MainContext)

  return (
    <div className="w-3/4 md:w-2/3 lg:w-1/3 mx-auto">
      <h1 className="text-white text-4xl font-normal pb-10 text-center">Tres en raya</h1>

      {step === 0 && (
        <Menu />
      )}
      {step === 1 && (
        <Dashboard bot={bot}/>
      )}
    </div>
  )
}
