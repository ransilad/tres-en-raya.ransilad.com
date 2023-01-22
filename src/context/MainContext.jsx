import React, { useState } from 'react'
import { TURNS } from '../constants.js'

const Context = React.createContext({})

export const MainProvider = ({ children }) => {
  const [step, setStep] = useState(0)
  const [bot, setBot] = useState(false)
  const [level, setLevel] = useState('low')
  const [players, setPlayers] = useState(TURNS)

  const value = {
    step,
    setStep,
    bot,
    setBot,
    level,
    setLevel,
    players,
    setPlayers
  }

  return <Context.Provider value={value}>
    {children}
  </Context.Provider>
}

export default Context
