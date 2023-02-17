import { Square } from './Square'
import { ResetButton } from './ResetButton'
import { OutlineButton } from './OutlineButton'
import { useDashboard } from '../hooks/useDashboard'
import Alerts from './Alerts'
import WaitPlayers from './WaitPlayers'
import Turns from './Turns'

export const Dashboard = () => {
  const {
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
  } = useDashboard()

  return (
    <>
      {roomSelected && getCurrentRoom().players < 2 && <WaitPlayers backToMenu={backToMenu}/>}

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

          <Alerts
            winner={winner}
            roomSelected={roomSelected}
            myTurn={myTurn}
            getCurrentRoom={getCurrentRoom}
          />

          <section className='my-5 flex justify-between flex-col md:flex-row'>
            <div className='w-full order-2 md:order-1 flex justify-end flex-col gap-5 md:gap-2'>
              <Turns
                winner={winner}
                roomSelected={roomSelected}
                turn={turn}
                myTurn={myTurn}
                getCurrentRoom={getCurrentRoom}
              />
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
