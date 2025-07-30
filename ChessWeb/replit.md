# Chess Game Application

## Overview

This is a full-stack chess game application built with React (frontend) and Express.js (backend). The application features a complete chess implementation with game logic, board visualization, move validation, and game state management. The architecture follows a modern monorepo structure with shared types and schemas.

## User Preferences

Preferred communication style: Simple, everyday language.
User interested in: Mobile chess gameplay, AI opponent functionality, deployment options and costs.
Successfully deployed chess game to Netlify for free hosting.
Wants to share project on LinkedIn profile.
Added AI chat assistant feature with OpenAI integration and actual code injection for technical queries.
Created LinkedIn post templates focusing on technical architecture, AI integration, and deployment strategies for professional networking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks with custom game logic hooks
- **Data Fetching**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **API Design**: RESTful API with `/api` prefix routing

### Chess Game Logic
- **Game Engine**: Custom chess implementation with complete rule validation
- **AI Engine**: Minimax algorithm with alpha-beta pruning for strategic play
- **Difficulty Levels**: Easy, Medium, Hard with varying search depths
- **Move Validation**: Comprehensive piece movement rules including special moves (castling, en passant)
- **Game States**: Support for check, checkmate, stalemate detection
- **Board Representation**: 8x8 array-based board with piece objects
- **Move History**: Complete move tracking with algebraic notation
- **Mobile Touch Support**: Optimized for mobile devices with touch controls

## Key Components

### Chess Engine (`client/src/lib/chess-logic.ts`)
- Complete chess rule implementation
- Piece movement validation
- Game state detection (check, checkmate, stalemate)
- Move history and algebraic notation
- Board initialization and manipulation

### Game Hook (`client/src/hooks/use-chess-game.tsx`)
- Game state management
- Move execution and validation
- Undo functionality
- Captured pieces tracking
- Game status updates

### UI Components
- **ChessBoard**: Interactive 8x8 chess board with click handlers
- **ChessPiece**: Individual piece rendering with Unicode symbols
- **GameControls**: Game management (new game, undo, resign)
- **AiChat**: AI assistant with actual code injection for technical queries
- **Shadcn/ui**: Complete UI component library for consistent design

### AI Chat Assistant (`client/src/components/ai-chat.tsx`)
- Floating chat interface with OpenAI integration
- Code injection system loads actual project files into LLM context
- Fallback responses when OpenAI quota exceeded
- Technical Q&A about project architecture, implementation, and algorithms
- Real-time code analysis and explanations

### Storage Layer (`server/storage.ts`)
- Abstract storage interface for CRUD operations
- In-memory storage implementation for development
- User management system
- Extensible design for database integration

## Data Flow

1. **Game Initialization**: Board is created with standard chess starting position
2. **Move Input**: User clicks on squares to select pieces and destination
3. **Move Validation**: Chess logic validates move legality and game rules
4. **State Update**: Game state is updated with new board position and metadata
5. **UI Refresh**: React components re-render with updated game state
6. **History Tracking**: Moves are recorded in algebraic notation

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool with HMR
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database schema management

### Database
- **Drizzle ORM**: Type-safe database queries
- **Neon Database**: Serverless PostgreSQL hosting
- **Zod**: Runtime type validation for schemas

### State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Wouter**: Lightweight routing

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with HMR
- **Database**: Neon Database connection via environment variables
- **Build Process**: Vite builds frontend, ESBuild bundles backend

### Production
- **Frontend**: Static files served from `dist/public`
- **Backend**: Node.js server serving API and static files
- **Database**: PostgreSQL migrations via Drizzle Kit
- **Environment**: Production-ready with proper error handling

### Build Commands
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build (frontend + backend)
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

### Configuration
- Database connection via `DATABASE_URL` environment variable
- Shared TypeScript configuration across frontend/backend
- Path aliases for clean imports (`@/`, `@shared/`)
- PostCSS configuration for Tailwind processing

The application is designed as a complete chess game with room for future enhancements like multiplayer support, game persistence, user accounts, and competitive features.