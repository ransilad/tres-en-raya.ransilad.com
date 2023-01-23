import { useContext } from 'react'
import MainContext from '../context/MainContext.jsx'
import { PLAYERS_OPTIONS } from '../constants.js'

export const PlayersLists = () => {
  const { players, setPlayers } = useContext(MainContext)

  return (
    <>
      <select className="border rounded-md px-4 py-2 bg-transparent text-white text-center hover:bg-gray-800 hover:border-gray-900 cursor-pointer" onChange={(e) => {
        setPlayers({
          X: e.target.value.split(',')[0],
          O: e.target.value.split(',')[1]
        })
      }} value={`${players.X},${players.O}`}>
        {PLAYERS_OPTIONS.map((option, index) => (
          <option key={index} value={`${option[0]},${option[1]}`}>{option[0]} vs {option[1]}</option>
        ))}
      </select>
    </>
  )
}
