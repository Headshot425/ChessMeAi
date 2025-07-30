import { Board, Square } from '../lib/chess-logic';
import { ChessPiece } from './chess-piece';
import { useCallback, useRef } from 'react';

interface ChessBoardProps {
  board: Board;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
}

export function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick
}: ChessBoardProps) {
  const touchStartRef = useRef<{ x: number; y: number; target: HTMLElement } | null>(null);
  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
  };

  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from[0] === row && lastMove.from[1] === col) ||
      (lastMove.to[0] === row && lastMove.to[1] === col)
    );
  };

  const getSquareColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? 'board-light' : 'board-dark';
  };

  const getSquareName = (row: number, col: number) => {
    return String.fromCharCode(97 + col) + (8 - row);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent, square: Square) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      target: e.currentTarget as HTMLElement
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent, square: Square) => {
    e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // If touch moved less than 10px, treat as a tap
    if (deltaX < 10 && deltaY < 10) {
      onSquareClick(square);
    }

    touchStartRef.current = null;
  }, [onSquareClick]);

  const handleClick = useCallback((square: Square) => {
    onSquareClick(square);
  }, [onSquareClick]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-3 sm:p-6">
      <div className="grid grid-cols-8 gap-0 aspect-square w-full max-w-lg mx-auto border-4 border-gray-800 dark:border-gray-600">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const piece = board[row][col];
            const squareName = getSquareName(row, col);
            
            let squareClasses = `chess-square ${getSquareColor(row, col)} aspect-square flex items-center justify-center text-3xl sm:text-4xl relative cursor-pointer touch-none select-none`;
            
            if (isSquareSelected(row, col)) {
              squareClasses += ' selected';
            }
            if (isValidMoveSquare(row, col)) {
              squareClasses += ' valid-move';
            }
            if (isLastMoveSquare(row, col)) {
              squareClasses += ' last-move';
            }

            return (
              <div
                key={`${row}-${col}`}
                className={squareClasses}
                onClick={() => handleClick([row, col])}
                onTouchStart={(e) => handleTouchStart(e, [row, col])}
                onTouchEnd={(e) => handleTouchEnd(e, [row, col])}
                data-testid={`square-${squareName}`}
                data-square={squareName}
                data-row={row}
                data-col={col}
              >
                {piece && (
                  <ChessPiece piece={piece} />
                )}
                {isValidMoveSquare(row, col) && !piece && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full opacity-60" />
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Board Coordinates */}
      <div className="flex justify-between items-center mt-2 sm:mt-4 px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
        <div className="flex justify-between w-full">
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
