import {
  Board,
  Color,
  Square,
  Piece,
  ChessMove,
  getValidMoves,
  isInCheck,
  makeMove,
  PieceType
} from './chess-logic';

// Piece values for evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position tables for piece placement evaluation
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

function getPieceSquareValue(piece: Piece, row: number, col: number): number {
  const isWhite = piece.color === 'white';
  const adjustedRow = isWhite ? 7 - row : row;
  
  switch (piece.type) {
    case 'pawn':
      return PAWN_TABLE[adjustedRow][col];
    case 'knight':
      return KNIGHT_TABLE[adjustedRow][col];
    case 'king':
      return KING_TABLE[adjustedRow][col];
    default:
      return 0;
  }
}

function evaluateBoard(board: Board): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type];
        const positionValue = getPieceSquareValue(piece, row, col);
        const totalValue = pieceValue + positionValue;
        
        if (piece.color === 'white') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }
  
  return score;
}

function getAllPossibleMoves(board: Board, color: Color): ChessMove[] {
  const moves: ChessMove[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, [row, col], piece);
        
        for (const [toRow, toCol] of validMoves) {
          // Check if move is legal (doesn't leave king in check)
          const testBoard = board.map(r => [...r]);
          testBoard[toRow][toCol] = piece;
          testBoard[row][col] = null;
          
          if (!isInCheck(testBoard, color)) {
            moves.push({
              from: [row, col],
              to: [toRow, toCol],
              piece,
              captured: board[toRow][toCol] || undefined
            });
          }
        }
      }
    }
  }
  
  return moves;
}

function minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }
  
  const color = isMaximizing ? 'white' : 'black';
  const moves = getAllPossibleMoves(board, color);
  
  if (moves.length === 0) {
    // No legal moves - checkmate or stalemate
    if (isInCheck(board, color)) {
      return isMaximizing ? -Infinity : Infinity;
    }
    return 0; // Stalemate
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const eval_ = minimax(newBoard, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const eval_ = minimax(newBoard, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

export function getBestMove(board: Board, color: Color, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): ChessMove | null {
  const moves = getAllPossibleMoves(board, color);
  
  if (moves.length === 0) {
    return null;
  }
  
  // Set depth based on difficulty
  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  
  // For easy mode, add some randomness
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  let bestMove = moves[0];
  let bestValue = color === 'white' ? -Infinity : Infinity;
  
  for (const move of moves) {
    const newBoard = makeMove(board, move);
    const value = minimax(newBoard, depth - 1, color === 'black', -Infinity, Infinity);
    
    if (color === 'white' && value > bestValue) {
      bestValue = value;
      bestMove = move;
    } else if (color === 'black' && value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}

export function getRandomMove(board: Board, color: Color): ChessMove | null {
  const moves = getAllPossibleMoves(board, color);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}