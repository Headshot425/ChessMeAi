// Static responses for deployment without backend
export const STATIC_CHAT_RESPONSES: Record<string, string> = {
  "how does the chess ai work": `The chess AI uses a minimax algorithm with alpha-beta pruning:

**Core Algorithm:**
1. **Minimax**: Evaluates moves by simulating future game states
2. **Alpha-Beta Pruning**: Eliminates unnecessary calculations for better performance  
3. **Position Evaluation**: Uses piece values and piece-square tables
4. **Difficulty Levels**:
   - Easy: 2-ply depth + 20% random moves
   - Medium: 3-ply depth  
   - Hard: 4-ply depth

**Key Files:**
- \`chess-ai.ts\`: Server-side AI with full evaluation
- \`browser-chess-ai.ts\`: Optimized for static deployment
- \`chess-logic.ts\`: Core game rules and validation

**Implementation Details:**
- Position scoring considers piece placement
- Endgame detection for checkmate/stalemate
- Move ordering for better pruning efficiency`,

  "what technologies": `This chess game uses modern web technologies:

**Frontend Stack:**
- React 18 with TypeScript for type safety
- Tailwind CSS + Shadcn/ui for professional UI
- Vite for fast development and optimized builds
- Wouter for lightweight client-side routing

**State Management:**
- Custom React hooks for game logic
- TanStack Query for server state (dev mode)
- Local state for chess game management

**Chess Engine:**
- Custom implementation with complete rule validation
- Minimax AI with alpha-beta pruning
- Browser-optimized for static deployment
- Mobile touch support with responsive design

**Deployment:**
- Static build for zero-cost hosting
- Works on Netlify, Vercel, GitHub Pages
- No server required in production`,

  "mobile optimization": `Mobile features implemented for great touch experience:

**Touch Controls:**
1. **Tap Selection**: Tap piece to select, tap destination to move
2. **Visual Feedback**: Highlighted selected pieces and valid moves
3. **Touch-Friendly**: Large tap targets, clear visual states
4. **Responsive Layout**: Adapts to all screen sizes

**Performance Optimizations:**
- CSS transforms for smooth animations
- Optimized re-renders with React.memo
- Efficient state updates to prevent lag
- Touch event handling without delays

**Mobile-Specific Styling:**
- Hover states disabled on touch devices
- Proper viewport settings prevent zooming
- Board scales beautifully on all devices
- Accessible UI with good contrast ratios

**Files with mobile code:**
- \`chess-board.tsx\`: Touch event handlers
- \`index.css\`: Mobile-responsive styles
- \`use-chess-game.tsx\`: Optimized state management`,

  "deployment": `Deployment setup for your chess game:

**Current: Static Deployment (Free)**
- Built files in \`dist/public/\`
- No server required - runs entirely in browser
- AI engine runs client-side with JavaScript
- Perfect for Netlify, Vercel, GitHub Pages

**Build Process:**
1. \`npm run build\` creates production files
2. Frontend bundled with Vite (React + CSS)
3. Chess AI optimized for browser execution
4. Assets minimized and compressed

**Static Hosting Benefits:**
- Zero hosting costs
- Global CDN distribution
- Instant loading worldwide
- No server maintenance needed

**File Structure:**
- \`index.html\`: Main entry point
- \`assets/\`: CSS and JavaScript bundles
- All game logic embedded in JavaScript

**Deployment Ready:** Your current build supports full chess functionality without any backend dependencies!`,

  "ai implementation": `AI implementation details in your chess engine:

**Algorithm: Minimax with Alpha-Beta Pruning**

**Core Functions:**
- \`minimax()\`: Recursive position evaluation
- \`alphabeta()\`: Pruning optimization  
- \`evaluatePosition()\`: Position scoring
- \`generateMoves()\`: Legal move generation

**Position Evaluation:**
- Material count (piece values)
- Piece-square tables for positioning
- King safety considerations
- Center control evaluation

**Difficulty Implementation:**
- Easy: 2-ply + random factor
- Medium: 3-ply systematic search
- Hard: 4-ply deep analysis

**Performance Optimizations:**
- Move ordering for better pruning
- Transposition tables (future enhancement)
- Iterative deepening potential
- Browser-optimized for smooth gameplay

The AI provides challenging gameplay while maintaining responsive performance on all devices.`
};

export function getStaticChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for exact matches first
  for (const [key, response] of Object.entries(STATIC_CHAT_RESPONSES)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return response;
    }
  }
  
  // Check for keyword matches
  if (lowerMessage.includes('ai') || lowerMessage.includes('minimax') || lowerMessage.includes('algorithm')) {
    return STATIC_CHAT_RESPONSES["how does the chess ai work"];
  }
  
  if (lowerMessage.includes('tech') || lowerMessage.includes('stack') || lowerMessage.includes('framework')) {
    return STATIC_CHAT_RESPONSES["what technologies"];
  }
  
  if (lowerMessage.includes('mobile') || lowerMessage.includes('touch') || lowerMessage.includes('responsive')) {
    return STATIC_CHAT_RESPONSES["mobile optimization"];
  }
  
  if (lowerMessage.includes('deploy') || lowerMessage.includes('host') || lowerMessage.includes('build')) {
    return STATIC_CHAT_RESPONSES["deployment"];
  }
  
  if (lowerMessage.includes('implement') || lowerMessage.includes('code') || lowerMessage.includes('function')) {
    return STATIC_CHAT_RESPONSES["ai implementation"];
  }
  
  // Default response
  return `I can help explain this chess project! Try asking about:

**🎯 Popular Questions:**
• "How does the chess AI work?" - Algorithm and implementation details
• "What technologies are used?" - Tech stack and architecture  
• "Tell me about mobile features" - Touch controls and responsive design
• "How is deployment handled?" - Static hosting and build process
• "Explain the AI implementation" - Minimax algorithm details

**💡 You can also ask about:**
• Specific game features and functionality
• Code architecture and file structure  
• Performance optimizations
• Chess rules implementation
• UI/UX design decisions

**Note:** This is the static version with curated responses. For dynamic code analysis, use the development version with OpenAI integration!`;
}