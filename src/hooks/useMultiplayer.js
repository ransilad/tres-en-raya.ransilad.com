import { useContext, useState } from 'react'
import { ref, set, push } from 'firebase/database'

import { db } from '../services/firebase.js'
import MainContext from '../context/MainContext.jsx'
import { PLAYERS_OPTIONS } from '../constants.js'

const playerMultiplayer = {
  X: PLAYERS_OPTIONS[0][0],
  O: PLAYERS_OPTIONS[0][1]
}

export function useMultiplayer () {
  const [roomName, setRoomName] = useState('')
  const [roomNameFromSelect, setRoomNameFromSelect] = useState('')
  const { setStep, setBot, rooms, setRoomSelected, setPlayers, setMyTurn } = useContext(MainContext)

  const handleClickMultiplayer = () => {
    const _roomName = roomName || roomNameFromSelect
    const roomExist = rooms.find(room => room.code === _roomName)
    setPlayers(playerMultiplayer)

    if (roomExist) {
      if (!roomExist.free) {
        // TODO cambiar por un alert interno
        window.alert('Esta sala está llena')
        return
      }

      set(ref(db, 'rooms/' + roomExist.id), {
        ...roomExist,
        players: roomExist.players + 1,
        free: roomExist.players + 1 < 2,
        board: JSON.stringify(Array(9).fill(null)),
        turn: playerMultiplayer.X,
        firstTurn: playerMultiplayer.X,
        id: null
      }).then(() => {
        changeStateAfterFirebase(roomExist.id, roomExist.players === 0 ? playerMultiplayer.X : playerMultiplayer.O)
      })
    } else {
      push(ref(db, 'rooms'), {
        free: true,
        players: 1,
        code: _roomName,
        board: JSON.stringify(Array(9).fill(null)),
        turn: playerMultiplayer.X,
        firstTurn: playerMultiplayer.X
      }).then((data) => {
        changeStateAfterFirebase(data.key, playerMultiplayer.X)
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

  return {
    roomName,
    roomNameFromSelect,
    rooms,
    handleChanceRoomName,
    handleClickMultiplayer
  }
}
