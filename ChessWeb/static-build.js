#!/usr/bin/env node

// Static build script for free deployment
const fs = require('fs');
const path = require('path');

console.log('Building static version for free deployment...');

// Create static HTML file
const staticHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Game with AI</title>
    <meta name="description" content="Play chess against AI or with friends. Mobile-friendly chess game with multiple difficulty levels.">
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

// Write the static HTML
fs.writeFileSync('client/index.html', staticHTML);

// Create deploy instructions
const deployInstructions = `# Free Static Deployment

Your chess game is now ready for free static hosting!

## Netlify Deployment (Recommended)
1. Build the project: \`npm run build\`
2. Upload the \`dist\` folder to Netlify
3. Your chess game will be live instantly!

## Vercel Deployment
1. Build the project: \`npm run build\`
2. Upload the \`dist\` folder to Vercel
3. Set build output to \`dist\` folder

## GitHub Pages Deployment
1. Build the project: \`npm run build\`
2. Upload \`dist\` contents to your gh-pages branch
3. Enable GitHub Pages in repository settings

## Features Included
✅ Full chess game with AI opponent
✅ Mobile touch controls
✅ Multiple difficulty levels
✅ Two-player mode
✅ Move history and validation
✅ Responsive design

## Build Commands
- Development: \`npm run dev\`
- Production build: \`npm run build\`
- Preview build: \`npm run preview\`

Your chess game will work on any static hosting platform!
`;

fs.writeFileSync('DEPLOY.md', deployInstructions);

console.log('✅ Static build prepared!');
console.log('✅ Deploy instructions created in DEPLOY.md');
console.log('✅ Run "npm run build" to create production files');
console.log('✅ Upload the "dist" folder to any free static host!');