import { useState } from 'react'
import confetti from 'canvas-confetti'

import { TURNS } from './constants'
import { Square } from './components/Square'
import { checkEndGame, checkWinnerFrom } from './services/utils'
import { ResetButton } from './components/ResetButton'
import { Modal } from './components/Modal'

function App () {
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

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.X)
    setWinner(null)
  }

  return (
    <div className="bg-gray-800 min-h-screen w-full flex items-center justify-center flex-col">
      <div className="w-3/4 md:w-2/3 lg:w-1/3 mx-auto">
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
          <div className='w-full md:w-1/2 order-2 md:order-1 mt-5 md:mt-0 flex justify-end md:block'>
              <ResetButton resetGame={resetGame} />
          </div>
          <div className='w-full md:w-1/2 flex md:justify-end items-center gap-3 order-1 md:order-2'>
            <div className="text-white italic">Turno actual</div>
            <div className="text-4xl">{turn}</div>
          </div>
        </section>
      </div>

      {winner && (
        <Modal
          title="Felicidades"
          description={`El jugador ${winner} ha ganado la partida`}
          handleBtnMessage="Reiniciar el juego"
          handleBtnClick={resetGame}
        />
      )}
    </div>
  )
}

export default App
