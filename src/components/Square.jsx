export const Square = ({ square, index, updateBoard }) => {
  return (
    <div
      onClick={() => updateBoard(index)}
      className='aspect-square border border-gray-800 rounded-md text-white text-5xl md:text-8xl flex items-center justify-center cursor-pointer'
    >
      {square}
    </div>
  )
}
