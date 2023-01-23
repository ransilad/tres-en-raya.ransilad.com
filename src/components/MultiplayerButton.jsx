import { useContext, useState } from 'react'
import { ref, set, push } from 'firebase/database'

import { db } from '../services/firebase.js'
import MainContext from '../context/MainContext.jsx'
import { OutlineButton } from './OutlineButton.jsx'

export const MultiplayerButton = () => {
  const [roomName, setRoomName] = useState('')
  const {
    setStep,
    setBot,
    rooms,
    setRoomSelected,
    players,
    setMyTurn
  } = useContext(MainContext)

  const handleClickMultiplayer = () => {
    const roomExist = rooms.find(room => room.code === roomName)
    if (roomExist) {
      if (!roomExist.free) {
        // TODO cambiar por un alert interno
        alert('Esta sala está llena')
        return
      }

      set(ref(db, 'rooms/' + roomExist.id), {
        ...roomExist,
        players: roomExist.players + 1,
        free: roomExist.players + 1 < 2,
        board: JSON.stringify(Array(9).fill(null)),
        turn: players.X,
        id: null
      }).then(() => {
        setStep(1)
        setBot(false)
        setRoomSelected(roomExist.id)
        setMyTurn(roomExist.players === 0 ? players.X : players.O)
      })
    } else {
      push(ref(db, 'rooms'), {
        free: true,
        players: 1,
        code: roomName,
        board: JSON.stringify(Array(9).fill(null)),
        turn: players.X
      }).then((data) => {
        setStep(1)
        setBot(false)
        setRoomSelected(data.key)
        setMyTurn(players.X)
      })
    }
  }

  const handleChanceRoomName = (e) => {
    setRoomName(e.target.value)
    setRoomSelected('')
  }

  return (
    <div className="border rounded-md p-4 w-full flex flex-col gap-4">
      <input
        type="text"
        value={roomName}
        onChange={handleChanceRoomName}
        className="border rounded-md px-4 py-2 bg-gray-600 text-white text-center"
        placeholder="Código de la sala"
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <OutlineButton
        handleClick={handleClickMultiplayer}
        disabled={roomName === ''}
      >
        Multijugador
      </OutlineButton>
    </div>
  )
}
