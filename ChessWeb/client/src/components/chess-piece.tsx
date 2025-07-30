import { Piece, PIECE_SYMBOLS } from '../lib/chess-logic';
import { useCallback, useRef } from 'react';

interface ChessPieceProps {
  piece: Piece;
  onClick?: () => void;
}

export function ChessPiece({ piece, onClick }: ChessPieceProps) {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];
  
  return (
    <span
      className={`chess-piece ${piece.color === 'white' ? 'piece-white' : 'piece-black'}`}
      onClick={onClick}
      data-testid={`piece-${piece.color}-${piece.type}`}
    >
      {symbol}
    </span>
  );
}
