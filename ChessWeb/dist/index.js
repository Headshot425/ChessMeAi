// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/openai.ts
import OpenAI from "openai";
import fs from "fs";
import path from "path";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var FILE_CATEGORIES = {
  core: [
    "client/src/lib/chess-logic.ts",
    "client/src/lib/chess-ai.ts",
    "client/src/hooks/use-chess-game.tsx"
  ],
  ui: [
    "client/src/components/chess-board.tsx",
    "client/src/components/game-controls.tsx",
    "client/src/pages/chess.tsx"
  ],
  config: [
    "package.json",
    "replit.md"
  ]
};
function getRelevantFiles(query) {
  const lowerQuery = query.toLowerCase();
  let files = [];
  files.push(...FILE_CATEGORIES.core);
  if (lowerQuery.includes("component") || lowerQuery.includes("ui") || lowerQuery.includes("board") || lowerQuery.includes("button") || lowerQuery.includes("interface") || lowerQuery.includes("react")) {
    files.push(...FILE_CATEGORIES.ui);
  }
  if (lowerQuery.includes("deploy") || lowerQuery.includes("setup") || lowerQuery.includes("package") || lowerQuery.includes("config")) {
    files.push(...FILE_CATEGORIES.config);
  }
  return [...new Set(files)];
}
async function loadRelevantCode(query) {
  const relevantFiles = getRelevantFiles(query);
  let context = `# RELEVANT CODE FOR: "${query}"

`;
  let totalLength = 0;
  const MAX_CONTEXT_LENGTH = 1e4;
  for (const filePath of relevantFiles) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const fileSection = `## File: ${filePath}
\`\`\`
${content}
\`\`\`

`;
        if (totalLength + fileSection.length > MAX_CONTEXT_LENGTH) {
          context += `
## Additional Files Available
- ${filePath} (truncated to stay within limits)
`;
          break;
        }
        context += fileSection;
        totalLength += fileSection.length;
      }
    } catch (error) {
      console.log(`Could not load ${filePath}:`, error);
    }
  }
  context += `
**Context Stats**: ${totalLength} characters, ${relevantFiles.length} files loaded
`;
  return context;
}
var FALLBACK_RESPONSES = {
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
function findBestMatch(query) {
  const lowerQuery = query.toLowerCase();
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerQuery.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerQuery)) {
      return response;
    }
  }
  if (lowerQuery.includes("ai") || lowerQuery.includes("minimax")) {
    return FALLBACK_RESPONSES["how does the chess ai work"];
  }
  if (lowerQuery.includes("tech") || lowerQuery.includes("stack")) {
    return FALLBACK_RESPONSES["what technologies"];
  }
  if (lowerQuery.includes("mobile") || lowerQuery.includes("touch")) {
    return FALLBACK_RESPONSES["mobile optimization"];
  }
  if (lowerQuery.includes("deploy") || lowerQuery.includes("host")) {
    return FALLBACK_RESPONSES["deployment"];
  }
  return `I can help explain this chess project! Try asking about:

\u2022 How the chess AI works
\u2022 What technologies are used  
\u2022 Mobile optimization features
\u2022 Deployment process
\u2022 Code architecture
\u2022 Specific implementation details

Or ask more specific questions about the chess game implementation.

**Note**: To get detailed AI responses, add credits to your OpenAI account. Currently using fallback responses.`;
}
async function getChatResponse(message, context = "") {
  try {
    const projectCode = await loadRelevantCode(message);
    console.log(projectCode);
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
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1e3,
      // Increased for more detailed responses
      temperature: 0.7
    });
    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return findBestMatch(message);
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      const response = await getChatResponse(message, context || "");
      res.json({ response });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
