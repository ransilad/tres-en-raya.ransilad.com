import { useMultiplayer } from '../hooks/useMultiplayer.js'
import { OutlineButton } from './OutlineButton.jsx'

export const MultiplayerButton = () => {
  const {
    roomName,
    roomNameFromSelect,
    rooms,
    handleChanceRoomName,
    handleClickMultiplayer
  } = useMultiplayer()

  return (
    <div className="border rounded-md p-4 w-full flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="rooms" className="text-white text-center text-sm italic">Salas actuales</label>
        <select
          id="rooms"
          className="border rounded-md px-4 py-2 bg-transparent text-white text-center hover:bg-gray-800 hover:border-gray-900 cursor-pointer"
          onChange={(e) => handleChanceRoomName(e, true)}
          value={roomNameFromSelect}
        >
          <option value="">Seleccionar sala</option>
          {rooms.filter(r => r.free).map(room => (
            <option
              key={room.code}
              value={room.code}
            >
              {room.code} (Hay {room.players} jugador{room.players > 1 ? 'es' : ''})
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={roomName}
        onChange={handleChanceRoomName}
        className="border bg-transparent rounded-md px-4 py-2 bg-gray-600 text-white text-center"
        placeholder="Código de la sala"
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <OutlineButton
        handleClick={handleClickMultiplayer}
        disabled={roomName === '' && roomNameFromSelect === ''}
      >
        Multijugador
      </OutlineButton>
    </div>
  )
}
