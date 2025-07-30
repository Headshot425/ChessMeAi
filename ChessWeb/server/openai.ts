import OpenAI from "openai";
import fs from "fs";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Core project files by category - Smart loading based on query
const FILE_CATEGORIES = {
  core: [
    'client/src/lib/chess-logic.ts',
    'client/src/lib/chess-ai.ts',
    'client/src/hooks/use-chess-game.tsx'
  ],
  ui: [
    'client/src/components/chess-board.tsx',
    'client/src/components/game-controls.tsx',
    'client/src/pages/chess.tsx'
  ],
  config: [
    'package.json',
    'replit.md'
  ]
};

function getRelevantFiles(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  let files: string[] = [];
  
  // Always include core chess logic
  files.push(...FILE_CATEGORIES.core);
  
  // Add UI files if asking about components/interface
  if (lowerQuery.includes('component') || lowerQuery.includes('ui') || 
      lowerQuery.includes('board') || lowerQuery.includes('button') ||
      lowerQuery.includes('interface') || lowerQuery.includes('react')) {
    files.push(...FILE_CATEGORIES.ui);
  }
  
  // Add config if asking about setup/deployment
  if (lowerQuery.includes('deploy') || lowerQuery.includes('setup') || 
      lowerQuery.includes('package') || lowerQuery.includes('config')) {
    files.push(...FILE_CATEGORIES.config);
  }
  
  return Array.from(new Set(files)); // Remove duplicates
}

async function loadRelevantCode(query: string): Promise<string> {
  const relevantFiles = getRelevantFiles(query);
  let context = `# RELEVANT CODE FOR: "${query}"\n\n`;
  let totalLength = 0;
  const MAX_CONTEXT_LENGTH = 10000; // ~2500 tokens, safe for GPT-4o-mini's 128k limit
  
  for (const filePath of relevantFiles) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Check if adding this file would exceed limit
        const fileSection = `## File: ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        if (totalLength + fileSection.length > MAX_CONTEXT_LENGTH) {
          context += `\n## Additional Files Available\n- ${filePath} (truncated to stay within limits)\n`;
          break;
        }
        
        context += fileSection;
        totalLength += fileSection.length;
      }
    } catch (error) {
      console.log(`Could not load ${filePath}:`, error);
    }
  }
  
  context += `\n**Context Stats**: ${totalLength} characters, ${relevantFiles.length} files loaded\n`;
  return context;
}

// Fallback responses for common chess project questions
const FALLBACK_RESPONSES: Record<string, string> = {
  "how does the chess ai work": `The chess AI uses a minimax algorithm with alpha-beta pruning:

1. **Minimax Algorithm**: Evaluates possible moves by simulating future game states
2. **Alpha-Beta Pruning**: Optimizes performance by eliminating unnecessary calculations
3. **Position Evaluation**: Uses piece values and position tables to score board states
4. **Difficulty Levels**: 
   - Easy: 2-ply search depth + random moves
   - Medium: 3-ply search depth
   - Hard: 4-ply search depth

Key files: chess-ai.ts and browser-chess-ai.ts`,

  "what technologies": `This chess game uses modern web technologies:

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui components
- Vite for fast development
- Wouter for routing

**Backend:**
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Neon Database (serverless)

**AI Engine:**
- Custom minimax implementation
- Browser-based for static deployment
- Position evaluation with piece-square tables`,

  "mobile optimization": `Mobile features implemented:

1. **Touch Events**: Custom tap handlers for piece selection
2. **Responsive Design**: Tailwind CSS breakpoints
3. **Viewport Settings**: Prevents zooming, optimized scaling
4. **Touch-Friendly UI**: Larger tap targets, clear visual feedback
5. **CSS Optimizations**: Hover states adapted for touch devices

Files: chess-board.tsx, index.css with mobile-specific styles`,

  "deployment": `Deployment setup:

**Static Version (Free):**
- Built files in dist/public/
- No server required - runs in browser
- Works on Netlify, Vercel, GitHub Pages
- AI runs client-side using JavaScript

**Full-Stack Version:**
- Express.js backend
- PostgreSQL database
- Requires server hosting like Railway or Replit

Current deployment uses static hosting for zero cost.`
};

function findBestMatch(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for keyword matches
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerQuery.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(lowerQuery)) {
      return response;
    }
  }
  
  // Check for specific terms
  if (lowerQuery.includes('ai') || lowerQuery.includes('minimax')) {
    return FALLBACK_RESPONSES["how does the chess ai work"];
  }
  if (lowerQuery.includes('tech') || lowerQuery.includes('stack')) {
    return FALLBACK_RESPONSES["what technologies"];
  }
  if (lowerQuery.includes('mobile') || lowerQuery.includes('touch')) {
    return FALLBACK_RESPONSES["mobile optimization"];
  }
  if (lowerQuery.includes('deploy') || lowerQuery.includes('host')) {
    return FALLBACK_RESPONSES["deployment"];
  }
  
  return `I can help explain this chess project! Try asking about:

• How the chess AI works
• What technologies are used  
• Mobile optimization features
• Deployment process
• Code architecture
• Specific implementation details

Or ask more specific questions about the chess game implementation.

**Note**: To get detailed AI responses, add credits to your OpenAI account. Currently using fallback responses.`;
}

export async function getChatResponse(message: string, context: string = ''): Promise<string> {
  try {
    // Load relevant project files based on query
    const projectCode = await loadRelevantCode(message);
    console.log(projectCode)
    const systemPrompt = `You are a helpful technical assistant for a chess game project. 
    You have access to the ACTUAL SOURCE CODE of the project below.
    
    Use this code to provide detailed, accurate answers about implementation details,
    architecture, algorithms, and specific code questions.
    
    When explaining code, reference specific functions, classes, and implementations.
    Provide code examples from the actual project when relevant.
    
    ${projectCode}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1000, // Increased for more detailed responses
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    
    // Use fallback response when API fails
    return findBestMatch(message);
  }
}