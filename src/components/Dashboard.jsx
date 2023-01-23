import { useState, useEffect, useContext } from 'react'
import confetti from 'canvas-confetti'
import { ref, set } from 'firebase/database'

import { Square } from './Square'
import { checkEndGame, checkWinnerFrom, getBotMoveHard, getBotMoveLow } from '../services/utils'
import { ResetButton } from './ResetButton'
import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'
import { Alert } from './Alert.jsx'
import { db } from '../services/firebase.js'

export const Dashboard = ({ bot }) => {
  const { setStep, level, players, rooms, roomSelected, setRoomSelected, myTurn } = useContext(MainContext)
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

  return (
    <>
      {roomSelected && getCurrentRoom().players < 2 && (
        <>
          <div className="text-white italic">
            Esperando que se unan más jugadores
          </div>
          <div className="mt-16">
            <img src="/undraw_loading.svg" alt=""/>
          </div>
          <div className="mt-5">
            <OutlineButton handleClick={backToMenu}>
              Volver al menú
            </OutlineButton>
          </div>
        </>
      )}

      {((roomSelected && getCurrentRoom().players === 2) || !roomSelected) && (
        <>
          <section>
            <div className="grid grid-cols-3 gap-3">
              {board.map((square, index) => (
                <Square
                  key={index}
                  index={index}
                  square={square}
                  updateBoard={updateBoard}
                  opacity={winner ? winnerCombo.includes(index) ? 1 : 0.2 : null}
                />
              ))}
            </div>
          </section>

          {(
            (winner && roomSelected && myTurn !== getCurrentRoom().turn) ||
            (winner && !roomSelected && myTurn === winner)
          ) && <Alert winner={winner} title="¡Felicidades!" description="Has ganado la partida" />}
          {(
            (winner && roomSelected && myTurn === getCurrentRoom().turn) ||
            (winner && !roomSelected && myTurn !== winner)
          ) && <Alert title="¡Lo siento!" description="Perdiste la partida" />}
          {winner === false && <Alert title="Nadie ha ganado" description="¡Inténtalo nuevamente!" />}

          <section className='my-5 flex justify-between flex-col md:flex-row'>
            <div className='w-full order-2 md:order-1 flex justify-end flex-col gap-5 md:gap-2'>
              {(winner === null && roomSelected && myTurn === getCurrentRoom().turn) && (
                <div className="text-green-300 text-2xl text-center my-3 flex justify-center items-center gap-3">
                  Tú turno <span className="text-5xl">{turn}</span>
                </div>
              )}
              {(winner === null && roomSelected && myTurn !== getCurrentRoom().turn) && (
                <div className="text-gray-400 text-sm text-center italic my-3">
                  Esperando a que el otro jugador mueva
                </div>
              )}
              {winner === null && !roomSelected && (
                <div className='w-full flex md:justify-end items-center gap-3 mb-5'>
                  <div className="text-white italic">Turno actual</div>
                  <div className="text-4xl">{turn}</div>
                </div>
              )}
              <ResetButton resetGame={resetGame} />
              <OutlineButton handleClick={backToMenu}>
                Volver al menú
              </OutlineButton>
            </div>
          </section>
        </>
      )}
    </>
  )
}
