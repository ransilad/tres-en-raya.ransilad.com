import { WINNER_COMBOS } from '../constants.js'

export const checkWinnerFrom = (boardToCheck) => {
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
      return { winner: boardToCheck[a], combo: [a, b, c] }
    }
  }
  return { winner: false, combo: [] }
}

export const checkEndGame = (newBoard) => {
  return newBoard.every((square) => square !== null)
}

export const getBotMoveLow = (board) => {
  let move = Math.floor(Math.random() * 9)
  while (board[move] !== null) {
    move = Math.floor(Math.random() * 9)
  }
  return move
}

export const getBotMoveHard = (board, players) => {
  // Jugar en las esquinas
  if (board[4] === players.X && board.filter(v => v === null).length === 8) {
    if (board[0] === null) {
      return 0
    } else if (board[2] === null) {
      return 2
    } else if (board[6] === null) {
      return 6
    } else if (board[8] === null) {
      return 8
    }
  }

  // Validar para ganar
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (board[a] === players.O && board[b] === players.O && board[c] === null) {
      return c
    } else if (board[a] === players.O && board[b] === null && board[c] === players.O) {
      return b
    } else if (board[a] === null && board[b] === players.O && board[c] === players.O) {
      return a
    }
  }

  // Tapar jugadas ganadoras
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (board[a] === players.X && board[b] === players.X && board[c] === null) {
      return c
    } else if (board[a] === players.X && board[b] === null && board[c] === players.X) {
      return b
    } else if (board[a] === null && board[b] === players.X && board[c] === players.X) {
      return a
    }
  }

  if (board.filter(b => b === null).length === 9) {
    return getBotMoveLow(board)
  }

  // Demás jugadas
  // Combinaciones disponibles
  let possibleMoves = []
  for (const combo of WINNER_COMBOS) {
    const [a, b, c] = combo
    if (!(board[a] && board[b] && board[c]) && (board[a] || board[b] || board[c])) {
      possibleMoves.push(combo)
    }
  }
  // Seleccionar aleatoriamente entre las combinaciones disponibles
  let canUse = false
  while (!canUse) {
    const _possibleMoves = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
    for (const move of _possibleMoves) {
      if (board[move] === null) {
        canUse = true
        possibleMoves = _possibleMoves
      }
    }
  }
  // De la combinación anterior, seleccionar aleatoriamente una casilla
  let move = Math.floor(Math.random() * 3)
  while (board[possibleMoves[move]] !== null) {
    move = Math.floor(Math.random() * 3)
  }
  return possibleMoves[move]
}
