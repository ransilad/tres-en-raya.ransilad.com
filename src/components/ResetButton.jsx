export const ResetButton = ({ resetGame }) => {
  return (
    <button
        onClick={() => resetGame()}
        className="border border-red-500 bg-red-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-red-600 focus:outline-none focus:shadow-outline w-full"
    >
        Reiniciar el juego
    </button>
  )
}
