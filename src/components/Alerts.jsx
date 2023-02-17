import { Alert } from './Alert.jsx'

const Alerts = ({ winner, roomSelected, myTurn, getCurrentRoom }) => {
  return (
    <>
      {(
        (winner && roomSelected && myTurn !== getCurrentRoom().turn) ||
        (winner && !roomSelected && myTurn === winner)
      ) && <Alert winner={winner} title="¡Felicidades!" description="Has ganado la partida" />}
      {(
        (winner && roomSelected && myTurn === getCurrentRoom().turn) ||
        (winner && !roomSelected && myTurn !== winner)
      ) && <Alert title="¡Lo siento!" description="Perdiste la partida" />}
      {winner === false && <Alert title="Nadie ha ganado" description="¡Inténtalo nuevamente!" />}
    </>
  )
}

export default Alerts
