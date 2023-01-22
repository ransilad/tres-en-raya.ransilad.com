export const Alert = ({ winner, title, description }) => {
  const getClassName = () => {
    let className = 'flex rounded-lg p-4 text-sm mt-8'
    if (winner) {
      className += ' bg-green-100 text-green-700'
    } else {
      className += ' bg-blue-100 text-blue-700'
    }
    return className
  }

  return (
    <div className={getClassName()} role="alert">
      {winner && (
        <div className="text-4xl mr-3">
          {winner}
        </div>
      )}
      <div>
        <p className="font-medium">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  )
}
