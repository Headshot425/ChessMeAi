export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type Color = 'white' | 'black';
export type Square = [number, number]; // [row, col]

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface ChessMove {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'kingside' | 'queenside';
  enPassant?: boolean;
}

export type Board = (Piece | null)[][];

export const PIECE_SYMBOLS: Record<Color, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces
  board[0] = [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ];
  
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
  }
  
  // Place white pieces
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  board[7] = [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ];
  
  return board;
}

export function isValidSquare(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getValidMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece);
    case 'rook':
      return getRookMoves(board, from, piece);
    case 'knight':
      return getKnightMoves(board, from, piece);
    case 'bishop':
      return getBishopMoves(board, from, piece);
    case 'queen':
      return getQueenMoves(board, from, piece);
    case 'king':
      return getKingMoves(board, from, piece);
    default:
      return moves;
  }
}

function getPawnMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // Forward move
  const newRow = row + direction;
  if (isValidSquare(newRow, col) && !board[newRow][col]) {
    moves.push([newRow, col]);
    
    // Double move from starting position
    if (row === startRow && !board[newRow + direction][col]) {
      moves.push([newRow + direction, col]);
    }
  }
  
  // Captures
  for (const newCol of [col - 1, col + 1]) {
    if (isValidSquare(newRow, newCol) && board[newRow][newCol] && 
        board[newRow][newCol]!.color !== piece.color) {
      moves.push([newRow, newCol]);
    }
  }
  
  return moves;
}

function getRookMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dRow, dCol] of directions) {
    let newRow = row + dRow;
    let newCol = col + dCol;
    
    while (isValidSquare(newRow, newCol)) {
      if (!board[newRow][newCol]) {
        moves.push([newRow, newCol]);
      } else {
        if (board[newRow][newCol]!.color !== piece.color) {
          moves.push([newRow, newCol]);
        }
        break;
      }
      newRow += dRow;
      newCol += dCol;
    }
  }
  
  return moves;
}

function getKnightMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dRow, dCol] of knightMoves) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (isValidSquare(newRow, newCol) && 
        (!board[newRow][newCol] || board[newRow][newCol]!.color !== piece.color)) {
      moves.push([newRow, newCol]);
    }
  }
  
  return moves;
}

function getBishopMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dRow, dCol] of directions) {
    let newRow = row + dRow;
    let newCol = col + dCol;
    
    while (isValidSquare(newRow, newCol)) {
      if (!board[newRow][newCol]) {
        moves.push([newRow, newCol]);
      } else {
        if (board[newRow][newCol]!.color !== piece.color) {
          moves.push([newRow, newCol]);
        }
        break;
      }
      newRow += dRow;
      newCol += dCol;
    }
  }
  
  return moves;
}

function getQueenMoves(board: Board, from: Square, piece: Piece): Square[] {
  return [...getRookMoves(board, from, piece), ...getBishopMoves(board, from, piece)];
}

function getKingMoves(board: Board, from: Square, piece: Piece): Square[] {
  const [row, col] = from;
  const moves: Square[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (isValidSquare(newRow, newCol) && 
        (!board[newRow][newCol] || board[newRow][newCol]!.color !== piece.color)) {
      moves.push([newRow, newCol]);
    }
  }
  
  return moves;
}

export function isInCheck(board: Board, color: Color): boolean {
  // Find the king
  let kingPos: Square | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPos = [row, col];
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== color) {
        const moves = getValidMoves(board, [row, col], piece);
        if (moves.some(([r, c]) => r === kingPos![0] && c === kingPos![1])) {
          return true;
        }
      }
    }
  }
  
  return false;
}

export function isCheckmate(board: Board, color: Color): boolean {
  if (!isInCheck(board, color)) return false;
  
  // Try all possible moves for the current player
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, [row, col], piece);
        for (const [toRow, toCol] of moves) {
          // Simulate the move
          const originalPiece = board[toRow][toCol];
          board[toRow][toCol] = piece;
          board[row][col] = null;
          
          // Check if still in check
          const stillInCheck = isInCheck(board, color);
          
          // Restore the board
          board[row][col] = piece;
          board[toRow][toCol] = originalPiece;
          
          if (!stillInCheck) {
            return false; // Found a legal move, not checkmate
          }
        }
      }
    }
  }
  
  return true; // No legal moves found, it's checkmate
}

export function isStalemate(board: Board, color: Color): boolean {
  if (isInCheck(board, color)) return false;
  
  // Check if there are any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, [row, col], piece);
        for (const [toRow, toCol] of moves) {
          // Simulate the move
          const originalPiece = board[toRow][toCol];
          board[toRow][toCol] = piece;
          board[row][col] = null;
          
          // Check if this results in check
          const resultsInCheck = isInCheck(board, color);
          
          // Restore the board
          board[row][col] = piece;
          board[toRow][toCol] = originalPiece;
          
          if (!resultsInCheck) {
            return false; // Found a legal move, not stalemate
          }
        }
      }
    }
  }
  
  return true; // No legal moves found, it's stalemate
}

export function makeMove(board: Board, move: ChessMove): Board {
  const newBoard = board.map(row => [...row]);
  const { from, to, piece } = move;
  
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;
  
  return newBoard;
}

export function squareToAlgebraic(square: Square): string {
  const [row, col] = square;
  return String.fromCharCode(97 + col) + (8 - row);
}

export function algebraicToSquare(algebraic: string): Square {
  const col = algebraic.charCodeAt(0) - 97;
  const row = 8 - parseInt(algebraic[1]);
  return [row, col];
}
