import { useState, useEffect, useContext } from 'react'
import confetti from 'canvas-confetti'

import { Square } from './Square'
import { checkEndGame, checkWinnerFrom, getBotMoveHard, getBotMoveLow } from '../services/utils'
import { ResetButton } from './ResetButton'
import { OutlineButton } from './OutlineButton'
import MainContext from '../context/MainContext'
import { Alert } from './Alert.jsx'

export const Dashboard = ({ bot }) => {
  const { setStep, level, players } = useContext(MainContext)
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(players.X)
  const [winner, setWinner] = useState(null)
  const [winnerCombo, setWinnerCombo] = useState([])

  const updateBoard = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newTurn = turn === players.X ? players.O : players.X
    setTurn(newTurn)

    const { winner: newWinner, combo } = checkWinnerFrom(newBoard)
    if (newWinner) {
      setWinnerCombo(combo)
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
    setWinnerCombo([])
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
              opacity={winner ? winnerCombo.includes(index) ? 1 : 0.2 : null}
            />
          ))}
        </div>
      </section>

      {winner && <Alert winner={winner} title="Felicidades!" description="Has ganado la partida" />}
      {winner === false && <Alert title="Nadie ha ganado" description="¡Inténtalo nuevamente!" />}

      <section className='my-5 flex justify-between flex-col md:flex-row'>
        <div className='w-full order-2 md:order-1 flex justify-end flex-col gap-5 md:gap-2'>
          {winner === null && (
            <div className='w-full flex md:justify-end items-center gap-3 mb-5'>
              <div className="text-white italic">Turno actual</div>
              <div className="text-4xl">{turn}</div>
            </div>
          )}
          <ResetButton resetGame={resetGame} />
          <OutlineButton handleClick={() => setStep(0)}>
            Volver al menú
          </OutlineButton>
        </div>
      </section>
    </>
  )
}
