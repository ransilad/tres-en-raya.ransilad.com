import { useContext, useState } from 'react'
import { ref, set, push } from 'firebase/database'

import { db } from '../services/firebase.js'
import MainContext from '../context/MainContext.jsx'
import { OutlineButton } from './OutlineButton.jsx'

export const MultiplayerButton = () => {
  const [roomName, setRoomName] = useState('')
  const [roomNameFromSelect, setRoomNameFromSelect] = useState('')
  const {
    setStep,
    setBot,
    rooms,
    setRoomSelected,
    players,
    setMyTurn
  } = useContext(MainContext)

  const handleClickMultiplayer = () => {
    const _roomName = roomName || roomNameFromSelect
    const roomExist = rooms.find(room => room.code === _roomName)
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
        firstTurn: players.X,
        id: null
      }).then(() => {
        changeStateAfterFirebase(roomExist.id, roomExist.players === 0 ? players.X : players.O)
      })
    } else {
      push(ref(db, 'rooms'), {
        free: true,
        players: 1,
        code: _roomName,
        board: JSON.stringify(Array(9).fill(null)),
        turn: players.X,
        firstTurn: players.X
      }).then((data) => {
        changeStateAfterFirebase(data.key, players.X)
      })
    }
  }

  const changeStateAfterFirebase = (_roomSelected, _turn) => {
    setStep(1)
    setBot(false)
    setRoomSelected(_roomSelected)
    setMyTurn(_turn)
  }

  const handleChanceRoomName = (e, fromSelect = false) => {
    if (fromSelect) {
      setRoomNameFromSelect(e.target.value)
      setRoomName('')
    } else {
      setRoomName(e.target.value)
      setRoomNameFromSelect('')
    }
    setRoomSelected('')
  }

  return (
    <div className="border rounded-md p-4 w-full flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="rooms" className="text-white text-center text-sm italic">Salas actuales</label>
        <select
          id="rooms"
          className="border rounded-md px-4 py-2 bg-gray-600 text-white text-center"
          onChange={(e) => handleChanceRoomName(e, true)}
          value={roomNameFromSelect}
        >
          <option value="">Seleccionar sala</option>
          {rooms.filter(r => r.free).map(room => (
            <option key={room.code} value={room.code}>{room.code} (Hay {room.players} jugador{room.players > 1 ? 'es' : ''})</option>
          ))}
        </select>
      </div>
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
        disabled={roomName === '' && roomNameFromSelect === ''}
      >
        Multijugador
      </OutlineButton>
    </div>
  )
}
