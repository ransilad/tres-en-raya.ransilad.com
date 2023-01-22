import { useState, useEffect, useContext } from 'react'
import confetti from 'canvas-confetti'

import { TURNS } from '../constants'
import { Square } from './Square'
import { checkEndGame, checkWinnerFrom } from '../services/utils'
import { ResetButton } from './ResetButton'
import { Modal } from './Modal'
import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'

export const Dashboard = ({ bot }) => {
  const { setStep } = useContext(MainContext)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(TURNS.X)
  const [winner, setWinner] = useState(null)

  const updateBoard = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
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
    if (bot && turn === TURNS.O) {
      setTimeout(() => {
        const availableSquares = board.map((v, i) => v == null ? i : null).filter(v => v !== null)
        const randomIndex = Math.floor(Math.random() * availableSquares.length)
        updateBoard(availableSquares[randomIndex])
      }, 200)
    }
  }, [turn])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.X)
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
