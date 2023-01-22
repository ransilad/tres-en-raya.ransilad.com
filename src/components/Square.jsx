export const Square = ({ square, index, updateBoard, opacity }) => {
  return (
    <div
      onClick={() => updateBoard(index)}
      className='aspect-square border border-gray-800 rounded-md text-white text-5xl md:text-6xl lg:text-7xl flex items-center justify-center cursor-pointer'
      style={{ opacity }}
    >
      {square}
    </div>
  )
}
