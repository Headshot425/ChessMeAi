import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Color, Piece, PIECE_SYMBOLS } from '../lib/chess-logic';

interface GameControlsProps {
  currentPlayer: Color;
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  winner: Color | null;
  moveHistory: string[];
  capturedPieces: {
    whiteCaptured: Piece[];
    blackCaptured: Piece[];
  };
  isAiMode: boolean;
  playerColor: Color;
  isAiThinking: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onResign: () => void;
}

export function GameControls({
  currentPlayer,
  gameStatus,
  winner,
  moveHistory,
  capturedPieces,
  isAiMode,
  playerColor,
  isAiThinking,
  onNewGame,
  onUndo,
  onResign
}: GameControlsProps) {
  const getStatusText = () => {
    if (isAiThinking) {
      return 'AI is thinking...';
    }
    
    switch (gameStatus) {
      case 'check':
        if (isAiMode) {
          const playerInCheck = currentPlayer === playerColor ? 'You are' : 'AI is';
          return `${playerInCheck} in Check!`;
        }
        return `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} in Check!`;
      case 'checkmate':
        if (isAiMode && winner) {
          const winnerText = winner === playerColor ? 'You Win!' : 'AI Wins!';
          return `Checkmate! ${winnerText}`;
        }
        return `Checkmate! ${winner?.charAt(0).toUpperCase() + winner?.slice(1)} Wins!`;
      case 'stalemate':
        return 'Stalemate - Draw!';
      case 'draw':
        return 'Draw!';
      default:
        if (isAiMode) {
          const currentTurn = currentPlayer === playerColor ? 'Your Turn' : "AI's Turn";
          return currentTurn;
        }
        return `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    }
  };

  const renderCapturedPieces = (pieces: Piece[]) => {
    if (pieces.length === 0) return '—';
    return pieces.map((piece, index) => (
      <span key={index} className="text-lg">
        {PIECE_SYMBOLS[piece.color][piece.type]}
      </span>
    ));
  };

  return (
    <div className="w-full lg:w-80 space-y-4 sm:space-y-6">
      {/* Game Status */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {isAiMode ? 'AI Game Status' : 'Game Status'}
          </h2>
          
          {/* Current Turn */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className={`w-4 h-4 rounded-full border-2 border-gray-800 ${
                  currentPlayer === 'white' ? 'bg-white' : 'bg-black'
                } ${isAiThinking ? 'animate-pulse' : ''}`}
              />
              <span className="text-sm sm:text-lg font-medium dark:text-gray-200" data-testid="current-player">
                {getStatusText()}
              </span>
            </div>
            
            {isAiMode && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                You are playing as {playerColor === 'white' ? 'White' : 'Black'}
              </div>
            )}
          </div>

          {/* Captured Pieces */}
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">White Captured</div>
              <div className="min-h-[1.5rem]" data-testid="white-captured">
                {renderCapturedPieces(capturedPieces.whiteCaptured)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Black Captured</div>
              <div className="min-h-[1.5rem]" data-testid="black-captured">
                {renderCapturedPieces(capturedPieces.blackCaptured)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Controls</h3>
          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-10 sm:h-auto touch-manipulation" 
              onClick={onNewGame}
              data-testid="button-new-game"
            >
              New Game
            </Button>
            <Button 
              className="w-full bg-gray-600 hover:bg-gray-700 active:bg-gray-800 h-10 sm:h-auto touch-manipulation"
              onClick={onUndo}
              disabled={moveHistory.length === 0}
              data-testid="button-undo"
            >
              Undo Move
            </Button>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 h-10 sm:h-auto touch-manipulation"
              onClick={onResign}
              disabled={gameStatus !== 'playing' && gameStatus !== 'check'}
              data-testid="button-resign"
            >
              Resign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Move History */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Move History</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="text-sm text-gray-700 space-y-1 font-mono" data-testid="move-history">
              {moveHistory.length === 0 ? (
                <div className="text-gray-500">No moves yet</div>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={index}>{move}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Analysis */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Moves Played</span>
              <span className="font-medium" data-testid="moves-count">
                {Math.ceil(moveHistory.length)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Material Balance</span>
              <span className="font-medium" data-testid="material-balance">
                {capturedPieces.blackCaptured.length - capturedPieces.whiteCaptured.length > 0 ? '+' : ''}
                {capturedPieces.blackCaptured.length - capturedPieces.whiteCaptured.length || '0'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
