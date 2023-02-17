import { useState, useEffect, useContext } from 'react'
import confetti from 'canvas-confetti'
import { ref, set } from 'firebase/database'

import { checkEndGame, checkWinnerFrom, getBotMoveHard, getBotMoveLow } from '../services/utils'
import MainContext from '../context/MainContext'
import { db } from '../services/firebase.js'

export function useDashboard () {
  const { setStep, level, players, rooms, roomSelected, setRoomSelected, myTurn, bot } = useContext(MainContext)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(players.X)
  const [winner, setWinner] = useState(null)
  const [winnerCombo, setWinnerCombo] = useState([])

  // Efecto usado para el modo bot
  useEffect(() => {
    if (bot && turn === players.O && winner === null) {
      setTimeout(() => {
        if (level === 'low') { // Lógica para el nivel fácil
          updateBoard(getBotMoveLow(board))
        } else { // Lógica para el nivel difícil
          updateBoard(getBotMoveHard(board, players))
        }
      }, 100)
    }
  }, [turn, winner])

  // Efecto para actualizar el tablero [Modo multiplayer]
  useEffect(() => {
    if (roomSelected) {
      const currentRoom = getCurrentRoom()
      const boardOnFirebase = JSON.parse(currentRoom.board)

      setBoard(boardOnFirebase)
      setTurn(currentRoom.turn)
      setWinner(null)
      checkWinner(boardOnFirebase)
    }
  }, [rooms])

  const getCurrentRoom = () => {
    return rooms.find(room => room.id === roomSelected)
  }

  const updateBoardOnFirebase = (_board, _turn, updateFirstTurn = false) => {
    const currentRoom = getCurrentRoom()
    set(ref(db, 'rooms/' + roomSelected), {
      ...currentRoom,
      board: _board,
      turn: updateFirstTurn ? (currentRoom.firstTurn === players.X ? players.O : players.X) : _turn,
      firstTurn: updateFirstTurn ? (currentRoom.firstTurn === players.X ? players.O : players.X) : currentRoom.firstTurn,
      id: null
    })
  }

  const checkWinner = (_board) => {
    const { winner: newWinner, combo } = checkWinnerFrom(_board)
    if (newWinner) {
      setWinnerCombo(combo)
      setWinner(newWinner)
      if (newWinner === myTurn) {
        confetti()
      }
    } else if (checkEndGame(_board)) {
      setWinner(false)
    }
  }

  const updateBoard = (index) => {
    if (board[index] || winner) return
    if (roomSelected && myTurn !== turn) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === players.X ? players.O : players.X
    setTurn(newTurn)

    if (roomSelected) {
      updateBoardOnFirebase(JSON.stringify(newBoard), newTurn)
    }

    checkWinner(newBoard)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(Math.random() > 0.5 ? players.X : players.O)
    setWinner(null)
    setWinnerCombo([])

    if (roomSelected) {
      updateBoardOnFirebase(
        JSON.stringify(Array(9).fill(null)),
        players.X,
        true
      )
    }
  }

  const backToMenu = () => {
    setStep(0)

    // Eliminar jugador de la sala [Modo multiplayer]
    if (roomSelected) {
      const currentRoom = getCurrentRoom()
      set(ref(db, 'rooms/' + roomSelected), {
        ...currentRoom,
        board: JSON.stringify(Array(9).fill(null)),
        players: currentRoom.players - 1,
        free: currentRoom.players - 1 < 2,
        turn: players.X,
        id: null
      }).then(() => {
        setRoomSelected('')
      })
    }
  }

  return {
    roomSelected,
    getCurrentRoom,
    backToMenu,
    board,
    updateBoard,
    winner,
    winnerCombo,
    turn,
    myTurn,
    resetGame
  }
}
