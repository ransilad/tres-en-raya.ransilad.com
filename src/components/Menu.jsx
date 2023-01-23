import { useContext } from 'react'

import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'
import { PlayersLists } from './PlayersLists.jsx'
import { MultiplayerButton } from './MultiplayerButton.jsx'

export const Menu = () => {
  const { setStep, setBot, setLevel, setMyTurn, players } = useContext(MainContext)

  return (
    <div className="w-full grid grid-cols-1 gap-5">
      <PlayersLists />
      <OutlineButton handleClick={() => {
        setStep(1)
        setBot(false)
        setMyTurn(players.X)
      }}>
        Local
      </OutlineButton>
      <OutlineButton handleClick={() => {
        setStep(1)
        setBot(true)
        setLevel('low')
        setMyTurn(players.X)
      }}>
        Contra el bot (Fácil)
      </OutlineButton>
      <OutlineButton handleClick={() => {
        setStep(1)
        setBot(true)
        setLevel('hard')
        setMyTurn(players.X)
      }}>
        Contra el bot (Difícil)
      </OutlineButton>
      <MultiplayerButton />
    </div>
  )
}
