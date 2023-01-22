import { useContext } from 'react'

import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'

export const Menu = () => {
  const { setStep, setBot } = useContext(MainContext)

  return (
    <div className="flex flex-col w-full gap-5">
      <OutlineButton handleClick={() => {
        setStep(1)
        setBot(false)
      }}>
        Local
      </OutlineButton>
      <OutlineButton handleClick={() => {
        setStep(1)
        setBot(true)
      }}>
        Contra el bot
      </OutlineButton>
      <OutlineButton disabled={true}>
        Multijugador
      </OutlineButton>
    </div>
  )
}
