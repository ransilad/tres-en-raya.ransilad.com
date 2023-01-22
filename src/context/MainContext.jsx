import React, { useState } from 'react'

const Context = React.createContext({})

export const MainProvider = ({ children }) => {
  const [step, setStep] = useState(0)
  const [bot, setBot] = useState(false)
  const [level, setLevel] = useState('low')

  const value = {
    step,
    setStep,
    bot,
    setBot,
    level,
    setLevel
  }

  return <Context.Provider value={value}>
    {children}
  </Context.Provider>
}

export default Context
