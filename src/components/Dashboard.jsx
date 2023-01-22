import { useState, useEffect, useContext } from 'react'
import confetti from 'canvas-confetti'

import { Square } from './Square'
import { checkEndGame, checkWinnerFrom, getBotMoveHard, getBotMoveLow } from '../services/utils'
import { ResetButton } from './ResetButton'
import { Modal } from './Modal'
import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'

export const Dashboard = ({ bot }) => {
  const { setStep, level, players } = useContext(MainContext)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(players.X)
  const [winner, setWinner] = useState(null)

  const updateBoard = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === players.X ? players.O : players.X
    setTurn(newTurn)

    const newWinner = checkWinnerFrom(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      confetti()
    } else if (checkEndGame(newBoard)) {
      setWinner(false)
    }
  }

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

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(players.X)
    setWinner(null)
  }

  return (
    <>
      <section>
        <div className="grid grid-cols-3 gap-3">
          {board.map((square, index) => (
            <Square
              key={index}
              index={index}
              square={square}
              updateBoard={updateBoard}
            />
          ))}
        </div>
      </section>
      <section className='mt-4 flex justify-between flex-col md:flex-row'>
        <div className='w-full md:w-1/2 order-2 md:order-1 mt-5 md:mt-0 flex justify-end flex-col gap-5 md:gap-2'>
          <ResetButton resetGame={resetGame} />
          <OutlineButton handleClick={() => {
            setStep(0)
          }}>
            Volver al menú
          </OutlineButton>
        </div>
        <div className='w-full md:w-1/2 flex md:justify-end items-center gap-3 order-1 md:order-2'>
          <div className="text-white italic">Turno actual</div>
          <div className="text-4xl">{turn}</div>
        </div>
      </section>

      {winner && (
        <Modal
          title="Felicidades"
          description={`El jugador ${winner} ha ganado la partida`}
          handleBtnMessage="Reiniciar el juego"
          handleBtnClick={resetGame}
        />
      )}
      {winner === false && (
        <Modal
          title="Wow..."
          description="Nadie ha ganado, a empezar de nuevo"
          handleBtnMessage="Reiniciar el juego"
          handleBtnClick={resetGame}
        />
      )}
    </>
  )
}
