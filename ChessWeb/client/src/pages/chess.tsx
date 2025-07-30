import { useChessGame } from '../hooks/use-chess-game';
import { ChessBoard } from '../components/chess-board';
import { GameControls } from '../components/game-controls';
import { GameModeSelector } from '../components/game-mode-selector';
import { AiChat } from '../components/ai-chat';
import { Button } from '@/components/ui/button';
import { Color } from '../lib/chess-logic';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ChessGame() {
  const {
    gameState,
    selectSquare,
    resetGame,
    undoMove,
    getCapturedPieces,
    getMoveHistoryDisplay,
    setAiMode
  } = useChessGame();

  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);

  const capturedPieces = getCapturedPieces();
  const moveHistoryDisplay = getMoveHistoryDisplay();

  const handleResign = () => {
    if (confirm('Are you sure you want to resign?')) {
      setShowModeSelector(true);
    }
  };

  const handleNewGame = () => {
    setShowModeSelector(true);
  };

  const handleStartGame = (aiMode: boolean, playerColor?: Color, difficulty?: 'easy' | 'medium' | 'hard') => {
    if (aiMode) {
      setAiMode(true, playerColor, difficulty);
    } else {
      resetGame(false);
    }
    setShowModeSelector(false);
  };

  const isGameOver = gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate';

  const getGameEndMessage = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        return {
          title: 'Checkmate!',
          description: `${gameState.winner?.charAt(0).toUpperCase() + gameState.winner?.slice(1)} wins!`,
          icon: '🏆'
        };
      case 'stalemate':
        return {
          title: 'Stalemate!',
          description: 'The game ends in a draw.',
          icon: '🤝'
        };
      default:
        return {
          title: 'Game Over',
          description: 'The game has ended.',
          icon: '🎯'
        };
    }
  };

  const gameEndInfo = getGameEndMessage();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl min-h-screen">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">Chess Game</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tap pieces to select and move</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start justify-center">
        {/* Game Board Section */}
        <div className="flex-1 w-full max-w-2xl">
          <ChessBoard
            board={gameState.board}
            selectedSquare={gameState.selectedSquare}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            onSquareClick={selectSquare}
          />
        </div>

        {/* Game Control Panel */}
        <GameControls
          currentPlayer={gameState.currentPlayer}
          gameStatus={gameState.gameStatus}
          winner={gameState.winner}
          moveHistory={moveHistoryDisplay}
          capturedPieces={capturedPieces}
          isAiMode={gameState.isAiMode}
          playerColor={gameState.playerColor}
          isAiThinking={gameState.isAiThinking}
          onNewGame={handleNewGame}
          onUndo={undoMove}
          onResign={handleResign}
        />
      </div>

      {/* Game End Dialog */}
      <Dialog open={isGameOver} onOpenChange={() => {}}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">{gameEndInfo.icon}</div>
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                {gameEndInfo.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-6">
                {gameEndInfo.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleNewGame}
              data-testid="button-play-again"
            >
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Mode Selector */}
      <GameModeSelector
        isVisible={showModeSelector}
        onStartGame={handleStartGame}
      />

      {/* AI Chat Assistant */}
      <AiChat
        isOpen={showAiChat}
        onToggle={() => setShowAiChat(!showAiChat)}
      />
    </div>
  );
}
