const Turns = ({ winner, roomSelected, turn, myTurn, getCurrentRoom }) => {
  return (
    <>
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
    </>
  )
}

export default Turns
