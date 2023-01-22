export const OutlineButton = ({ children, handleClick, disabled = false }) => {
  const getClassName = () => {
    let className = 'border rounded-md px-4 py-2 transition duration-500 ease select-none w-full'

    if (disabled) {
      className += ' border-gray-700 text-gray-700'
    } else {
      className += ' border-white text-white hover:bg-gray-700 hover:border-gray-800 focus:outline-none focus:shadow-outline'
    }

    return className
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={getClassName()}
    >
      {children}
    </button>
  )
}
