import { useState, useCallback, useEffect } from 'react';
import {
  Board,
  Color,
  Square,
  ChessMove,
  Piece,
  createInitialBoard,
  getValidMoves,
  isInCheck,
  isCheckmate,
  isStalemate,
  makeMove,
  squareToAlgebraic
} from '../lib/chess-logic';
import { getBestMove } from '../lib/browser-chess-ai';

export interface GameState {
  board: Board;
  currentPlayer: Color;
  selectedSquare: Square | null;
  validMoves: Square[];
  moveHistory: ChessMove[];
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  winner: Color | null;
  lastMove: ChessMove | null;
  isAiMode: boolean;
  playerColor: Color;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  isAiThinking: boolean;
}

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    gameStatus: 'playing',
    winner: null,
    lastMove: null,
    isAiMode: false,
    playerColor: 'white',
    aiDifficulty: 'medium',
    isAiThinking: false
  });

  const selectSquare = useCallback((square: Square) => {
    // Don't allow interaction if AI is thinking or it's not the player's turn in AI mode
    if (gameState.isAiThinking || (gameState.isAiMode && gameState.currentPlayer !== gameState.playerColor)) {
      return;
    }

    const [row, col] = square;
    const piece = gameState.board[row][col];

    // If clicking on empty square or opponent piece while having a selection, try to move
    if (gameState.selectedSquare && (!piece || piece.color !== gameState.currentPlayer)) {
      const isValidMove = gameState.validMoves.some(([r, c]) => r === row && c === col);
      if (isValidMove) {
        makePlayerMove(gameState.selectedSquare, square);
      } else {
        // Invalid move, deselect
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          validMoves: []
        }));
      }
      return;
    }

    // If clicking on own piece, select it
    if (piece && piece.color === gameState.currentPlayer) {
      const validMoves = getValidMoves(gameState.board, square, piece);
      // Filter out moves that would put own king in check
      const legalMoves = validMoves.filter(toSquare => {
        const testBoard = gameState.board.map(row => [...row]);
        testBoard[toSquare[0]][toSquare[1]] = piece;
        testBoard[row][col] = null;
        return !isInCheck(testBoard, gameState.currentPlayer);
      });

      setGameState(prev => ({
        ...prev,
        selectedSquare: square,
        validMoves: legalMoves
      }));
    } else {
      // Deselect if clicking on invalid target
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
    }
  }, [gameState]);

  const makePlayerMove = useCallback((from: Square, to: Square) => {
    const piece = gameState.board[from[0]][from[1]];
    if (!piece) return;

    const capturedPiece = gameState.board[to[0]][to[1]];
    const move: ChessMove = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined
    };

    const newBoard = makeMove(gameState.board, move);
    const nextPlayer: Color = gameState.currentPlayer === 'white' ? 'black' : 'white';

    // Check game status
    let gameStatus: GameState['gameStatus'] = 'playing';
    let winner: Color | null = null;

    if (isCheckmate(newBoard, nextPlayer)) {
      gameStatus = 'checkmate';
      winner = gameState.currentPlayer;
    } else if (isStalemate(newBoard, nextPlayer)) {
      gameStatus = 'stalemate';
    } else if (isInCheck(newBoard, nextPlayer)) {
      gameStatus = 'check';
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedSquare: null,
      validMoves: [],
      moveHistory: [...prev.moveHistory, move],
      gameStatus,
      winner,
      lastMove: move
    }));
  }, [gameState]);

  const resetGame = useCallback((aiMode = false, playerColor: Color = 'white', difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      moveHistory: [],
      gameStatus: 'playing',
      winner: null,
      lastMove: null,
      isAiMode: aiMode,
      playerColor,
      aiDifficulty: difficulty,
      isAiThinking: false
    });
  }, []);

  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0) return;

    const newHistory = [...gameState.moveHistory];
    const lastMove = newHistory.pop()!;
    
    // Restore the board state
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[lastMove.from[0]][lastMove.from[1]] = lastMove.piece;
    newBoard[lastMove.to[0]][lastMove.to[1]] = lastMove.captured || null;

    const previousPlayer: Color = gameState.currentPlayer === 'white' ? 'black' : 'white';

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: previousPlayer,
      selectedSquare: null,
      validMoves: [],
      moveHistory: newHistory,
      gameStatus: 'playing',
      winner: null,
      lastMove: newHistory.length > 0 ? newHistory[newHistory.length - 1] : null
    }));
  }, [gameState]);

  const getCapturedPieces = useCallback(() => {
    const whiteCaptured: Piece[] = [];
    const blackCaptured: Piece[] = [];

    gameState.moveHistory.forEach(move => {
      if (move.captured) {
        if (move.captured.color === 'white') {
          whiteCaptured.push(move.captured);
        } else {
          blackCaptured.push(move.captured);
        }
      }
    });

    return { whiteCaptured, blackCaptured };
  }, [gameState.moveHistory]);

  const getMoveHistoryDisplay = useCallback(() => {
    const moves: string[] = [];
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = gameState.moveHistory[i];
      const blackMove = gameState.moveHistory[i + 1];
      
      let moveStr = `${moveNumber}. ${squareToAlgebraic(whiteMove.to)}`;
      if (blackMove) {
        moveStr += ` ${squareToAlgebraic(blackMove.to)}`;
      }
      moves.push(moveStr);
    }
    return moves;
  }, [gameState.moveHistory]);

  // AI move logic
  useEffect(() => {
    if (gameState.isAiMode && 
        gameState.currentPlayer !== gameState.playerColor && 
        gameState.gameStatus === 'playing' && 
        !gameState.isAiThinking) {
      
      setGameState(prev => ({ ...prev, isAiThinking: true }));
      
      // Add a small delay to make AI moves feel more natural
      const aiDelay = gameState.aiDifficulty === 'easy' ? 500 : 
                     gameState.aiDifficulty === 'medium' ? 1000 : 1500;
      
      setTimeout(() => {
        const aiMove = getBestMove(gameState.board, gameState.currentPlayer, gameState.aiDifficulty);
        
        if (aiMove) {
          const capturedPiece = gameState.board[aiMove.to[0]][aiMove.to[1]];
          const move: ChessMove = {
            ...aiMove,
            captured: capturedPiece || undefined
          };

          const newBoard = makeMove(gameState.board, move);
          const nextPlayer: Color = gameState.currentPlayer === 'white' ? 'black' : 'white';

          // Check game status
          let gameStatus: GameState['gameStatus'] = 'playing';
          let winner: Color | null = null;

          if (isCheckmate(newBoard, nextPlayer)) {
            gameStatus = 'checkmate';
            winner = gameState.currentPlayer;
          } else if (isStalemate(newBoard, nextPlayer)) {
            gameStatus = 'stalemate';
          } else if (isInCheck(newBoard, nextPlayer)) {
            gameStatus = 'check';
          }

          setGameState(prev => ({
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedSquare: null,
            validMoves: [],
            moveHistory: [...prev.moveHistory, move],
            gameStatus,
            winner,
            lastMove: move,
            isAiThinking: false
          }));
        } else {
          setGameState(prev => ({ ...prev, isAiThinking: false }));
        }
      }, aiDelay);
    }
  }, [gameState.currentPlayer, gameState.isAiMode, gameState.playerColor, gameState.gameStatus, gameState.isAiThinking, gameState.board, gameState.aiDifficulty, gameState.moveHistory]);

  const setAiMode = useCallback((enabled: boolean, playerColor: Color = 'white', difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    resetGame(enabled, playerColor, difficulty);
  }, [resetGame]);

  return {
    gameState,
    selectSquare,
    resetGame,
    undoMove,
    getCapturedPieces,
    getMoveHistoryDisplay,
    setAiMode
  };
}
