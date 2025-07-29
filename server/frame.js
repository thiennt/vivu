import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Game state storage (in production, use a database)
const gameStates = new Map();

// Default game state
function createDefaultGameState() {
  return {
    playerHp: 16,
    playerMaxHp: 16,
    enemyHp: 15,
    enemyMaxHp: 15,
    playerStats: {
      attack: 5,
      defense: 5,
      critical: 20,
      agility: 3
    },
    enemyStats: {
      attack: 6,
      defense: 4,
      critical: 20,
      agility: 2
    },
    turn: 'player',
    gameOver: false,
    winner: null,
    lastAction: 'start'
  };
}

// Generate Frame image
async function generateFrameImage(gameState) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#E6E6E6';
  ctx.fillRect(0, 0, 1200, 630);

  // Stats area background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(50, 50, 1100, 200);

  // Draw stats
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 24px Arial';
  
  // Player stats (left side)
  ctx.textAlign = 'center';
  ctx.fillText(`${gameState.playerHp}/${gameState.playerMaxHp}`, 200, 100);
  ctx.fillText(`❤️`, 200, 130);
  
  ctx.fillText(`${gameState.playerStats.attack}`, 200, 180);
  ctx.fillText(`⚔️`, 200, 210);
  
  ctx.fillText(`${gameState.playerStats.defense}`, 200, 240);
  ctx.fillText(`🛡️`, 200, 270);

  // Enemy stats (right side)
  ctx.fillText(`${gameState.enemyHp}/${gameState.enemyMaxHp}`, 1000, 100);
  ctx.fillText(`❤️`, 1000, 130);
  
  ctx.fillText(`${gameState.enemyStats.attack}`, 1000, 180);
  ctx.fillText(`⚔️`, 1000, 210);
  
  ctx.fillText(`${gameState.enemyStats.defense}`, 1000, 240);
  ctx.fillText(`🛡️`, 1000, 270);

  // Battle area
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(50, 300, 1100, 250);

  // Draw stick figures
  drawStickFigure(ctx, 300, 450, 'black', gameState.playerHp > 0);
  drawStickFigure(ctx, 900, 450, 'red', gameState.enemyHp > 0);

  // Game status
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  
  if (gameState.gameOver) {
    ctx.fillText(`Game Over! ${gameState.winner} Wins!`, 600, 580);
  } else {
    ctx.fillText(`${gameState.turn === 'player' ? 'Your' : 'Enemy'} Turn`, 600, 580);
  }

  return canvas.toBuffer('image/png');
}

function drawStickFigure(ctx, x, y, color, alive) {
  ctx.strokeStyle = alive ? color : '#999999';
  ctx.lineWidth = 4;
  
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 60, 15, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 45);
  ctx.lineTo(x, y - 10);
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 30);
  ctx.lineTo(x + 20, y - 30);
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x - 15, y + 20);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 15, y + 20);
  ctx.stroke();
}

// Frame image endpoint
app.get('/api/frame/image', async (req, res) => {
  try {
    const gameId = req.query.gameId || 'default';
    let gameState = gameStates.get(gameId);
    
    if (!gameState) {
      gameState = createDefaultGameState();
      gameStates.set(gameId, gameState);
    }

    const imageBuffer = await generateFrameImage(gameState);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating frame image:', error);
    res.status(500).send('Error generating image');
  }
});

// Frame action endpoint
app.post('/api/frame/action', (req, res) => {
  try {
    const { untrustedData } = req.body;
    const buttonIndex = untrustedData.buttonIndex;
    const gameId = untrustedData.gameId || 'default';
    
    let gameState = gameStates.get(gameId);
    if (!gameState) {
      gameState = createDefaultGameState();
      gameStates.set(gameId, gameState);
    }

    // Handle button actions
    if (gameState.gameOver && buttonIndex !== 4) {
      // Game is over, only reset allowed
      return res.json({
        type: 'frame',
        frameUrl: `/?gameId=${gameId}`
      });
    }

    switch (buttonIndex) {
      case 1: // Attack
        if (gameState.turn === 'player') {
          const damage = Math.max(1, gameState.playerStats.attack - gameState.enemyStats.defense);
          gameState.enemyHp = Math.max(0, gameState.enemyHp - damage);
          gameState.lastAction = `Player attacked for ${damage} damage!`;
          gameState.turn = 'enemy';
        }
        break;
      
      case 2: // Defend
        if (gameState.turn === 'player') {
          gameState.playerStats.defense += 2; // Temporary defense boost
          gameState.lastAction = 'Player defends (+2 defense this turn)';
          gameState.turn = 'enemy';
        }
        break;
        
      case 3: // Special
        if (gameState.turn === 'player') {
          const damage = Math.floor(gameState.playerStats.attack * 1.5);
          gameState.enemyHp = Math.max(0, gameState.enemyHp - damage);
          gameState.lastAction = `Player used special attack for ${damage} damage!`;
          gameState.turn = 'enemy';
        }
        break;
        
      case 4: // Reset
        gameState = createDefaultGameState();
        gameStates.set(gameId, gameState);
        break;
    }

    // Enemy turn (if game not over and it's enemy's turn)
    if (!gameState.gameOver && gameState.turn === 'enemy' && gameState.enemyHp > 0) {
      setTimeout(() => {
        const enemyAction = Math.random();
        if (enemyAction < 0.7) { // 70% chance to attack
          const damage = Math.max(1, gameState.enemyStats.attack - gameState.playerStats.defense);
          gameState.playerHp = Math.max(0, gameState.playerHp - damage);
          gameState.lastAction = `Enemy attacked for ${damage} damage!`;
        } else { // 30% chance to defend
          gameState.enemyStats.defense += 1;
          gameState.lastAction = 'Enemy defends (+1 defense)';
        }
        
        // Reset any temporary defense bonuses
        if (gameState.playerStats.defense > 5) gameState.playerStats.defense = 5;
        
        gameState.turn = 'player';
        
        // Check win conditions
        if (gameState.playerHp <= 0) {
          gameState.gameOver = true;
          gameState.winner = 'Enemy';
        } else if (gameState.enemyHp <= 0) {
          gameState.gameOver = true;
          gameState.winner = 'Player';
        }
      }, 1000);
    }

    // Check win conditions
    if (gameState.playerHp <= 0) {
      gameState.gameOver = true;
      gameState.winner = 'Enemy';
    } else if (gameState.enemyHp <= 0) {
      gameState.gameOver = true;
      gameState.winner = 'Player';
    }

    // Return updated frame
    res.json({
      type: 'frame',
      frameUrl: `/?gameId=${gameId}`,
      image: `/api/frame/image?gameId=${gameId}&t=${Date.now()}`
    });

  } catch (error) {
    console.error('Error handling frame action:', error);
    res.status(500).json({ error: 'Error processing action' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  const gameId = req.query.gameId || 'default';
  
  // Generate frame HTML with updated metadata
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarStick - Battle Game</title>

    <!-- Farcaster Frame metadata -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="/api/frame/image?gameId=${gameId}&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="⚔️ Attack" />
    <meta property="fc:frame:button:2" content="🛡️ Defend" />
    <meta property="fc:frame:button:3" content="💨 Special" />
    <meta property="fc:frame:button:4" content="🔄 Reset" />
    <meta property="fc:frame:post_url" content="/api/frame/action" />
    
    <!-- Open Graph metadata for Frame -->
    <meta property="og:title" content="FarStick - Epic Stick Figure Battle" />
    <meta property="og:description" content="Battle epic stick figures in this engaging RPG game!" />
    <meta property="og:image" content="/api/frame/image?gameId=${gameId}&t=${Date.now()}" />
    <meta property="og:url" content="/" />
    <meta property="og:type" content="website" />

    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #E6E6E6;
        padding: 20px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
      }
      .game-info {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
      }
    </style> 
</head>
<body>
    <div class="container">
        <div class="game-info">
            <h1>🎮 FarStick Battle Game</h1>
            <p>This game is optimized as a Farcaster Frame!</p>
            <p>Share this on Farcaster to play with others.</p>
            <p>Use the buttons below the image to control your stick figure warrior.</p>
        </div>
        
        <!-- Fallback for non-frame viewers -->
        <div id="game-container">
            <script type="module" src="/src/app.ts"></script>
        </div>
    </div>
</body>
</html>`;

  res.send(html);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Frame server running on port ${PORT}`);
});

export default app;