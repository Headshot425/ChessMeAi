import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Color } from '../lib/chess-logic';
import { useState } from 'react';

interface GameModeSelectorProps {
  onStartGame: (aiMode: boolean, playerColor?: Color, difficulty?: 'easy' | 'medium' | 'hard') => void;
  isVisible: boolean;
}

export function GameModeSelector({ onStartGame, isVisible }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'human' | 'ai'>('human');
  const [playerColor, setPlayerColor] = useState<Color>('white');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  if (!isVisible) return null;

  const handleStartGame = () => {
    if (selectedMode === 'ai') {
      onStartGame(true, playerColor, difficulty);
    } else {
      onStartGame(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">Choose Game Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Mode Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Game Mode</Label>
            <RadioGroup 
              value={selectedMode} 
              onValueChange={(value) => setSelectedMode(value as 'human' | 'ai')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="human" id="human" />
                <Label htmlFor="human" className="font-normal">
                  Play with Human (Two Players)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai" id="ai" />
                <Label htmlFor="ai" className="font-normal">
                  Play against AI
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* AI Mode Options */}
          {selectedMode === 'ai' && (
            <>
              <div>
                <Label className="text-base font-medium mb-3 block">Your Color</Label>
                <RadioGroup 
                  value={playerColor} 
                  onValueChange={(value) => setPlayerColor(value as Color)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" />
                    <Label htmlFor="white" className="font-normal">
                      White (Play First)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="black" />
                    <Label htmlFor="black" className="font-normal">
                      Black (AI Plays First)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-base font-medium mb-3 block">
                  AI Difficulty
                </Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (Fast moves, some mistakes)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced play)</SelectItem>
                    <SelectItem value="hard">Hard (Strong strategic play)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Start Game Button */}
          <Button 
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
            data-testid="button-start-game"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}