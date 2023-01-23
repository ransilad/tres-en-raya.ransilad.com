import React, { useEffect, useState } from 'react'

import { TURNS } from '../constants.js'
import { onValue, ref } from 'firebase/database'
import { db } from '../services/firebase.js'
const Context = React.createContext({})

export const MainProvider = ({ children }) => {
  const [step, setStep] = useState(0)
  const [bot, setBot] = useState(false)
  const [level, setLevel] = useState('low')
  const [players, setPlayers] = useState(TURNS)
  const [rooms, setRooms] = useState([])
  const [roomSelected, setRoomSelected] = useState('')
  const [myTurn, setMyTurn] = useState(null)

  const value = {
    step,
    setStep,
    bot,
    setBot,
    level,
    setLevel,
    players,
    setPlayers,
    rooms,
    setRooms,
    roomSelected,
    setRoomSelected,
    myTurn,
    setMyTurn
  }

  useEffect(() => {
    const newsRef = ref(db, 'rooms')
    onValue(newsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const _data = []
        Object.keys(data).forEach(_id => {
          _data.push({
            id: _id,
            ...data[_id]
          })
        })
        setRooms(_data)
      } else {
        setRooms([])
      }
    })
  }, [])

  return <Context.Provider value={value}>
    {children}
  </Context.Provider>
}

export default Context
