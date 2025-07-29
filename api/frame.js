import express from 'express';
import { createCanvas } from 'canvas';
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

// Default game state matching the existing PixiJS game
function createDefaultGameState() {
  return {
    playerHp: 16,
    playerMaxHp: 16,
    enemyHp: 15,
    enemyMaxHp: 15,
    playerStats: {
      hp: 16,
      attack: 5,
      defense: 5,
      critical: 20,
      agility: 3
    },
    enemyStats: {
      hp: 15,
      attack: 6,
      defense: 4,
      critical: 20,
      agility: 2
    },
    turn: 'player',
    gameOver: false,
    winner: null,
    lastAction: 'Battle begins!',
    battlePhase: 'combat' // combat, stats_selection, game_over
  };
}

// Generate Frame image using Canvas
async function generateFrameImage(gameState) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 630);
  gradient.addColorStop(0, '#E6E6E6');
  gradient.addColorStop(1, '#CCCCCC');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Stats area background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(50, 50, 1100, 180);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, 1100, 180);

  // Draw player stats (left side)
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  
  // Player HP
  ctx.fillText(`${gameState.playerHp}/${gameState.playerMaxHp}`, 200, 100);
  ctx.font = '24px Arial';
  ctx.fillText('❤️ HP', 200, 130);
  
  // Player Attack
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${gameState.playerStats.attack}`, 200, 170);
  ctx.font = '18px Arial';
  ctx.fillText('⚔️ ATK', 200, 190);
  
  // Player Defense  
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${gameState.playerStats.defense}`, 200, 220);
  ctx.font = '18px Arial';
  ctx.fillText('🛡️ DEF', 200, 240);

  // Enemy stats (right side)
  ctx.font = 'bold 32px Arial';
  ctx.fillText(`${gameState.enemyHp}/${gameState.enemyMaxHp}`, 1000, 100);
  ctx.font = '24px Arial';
  ctx.fillText('❤️ HP', 1000, 130);
  
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${gameState.enemyStats.attack}`, 1000, 170);
  ctx.font = '18px Arial';
  ctx.fillText('⚔️ ATK', 1000, 190);
  
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${gameState.enemyStats.defense}`, 1000, 220);
  ctx.font = '18px Arial';
  ctx.fillText('🛡️ DEF', 1000, 240);

  // Battle area
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(50, 280, 1100, 250);
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 280, 1100, 250);

  // Draw stick figures
  drawStickFigure(ctx, 300, 450, 'black', gameState.playerHp > 0);
  drawStickFigure(ctx, 900, 450, 'red', gameState.enemyHp > 0);

  // Game status
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  
  if (gameState.gameOver) {
    ctx.fillStyle = gameState.winner === 'player' ? '#00AA00' : '#AA0000';
    ctx.fillText(`Game Over! ${gameState.winner === 'player' ? 'You Win!' : 'You Lose!'}`, 600, 570);
  } else {
    ctx.fillText(`${gameState.turn === 'player' ? 'Your Turn' : 'Enemy Turn'}`, 600, 570);
  }

  // Last action
  ctx.fillStyle = '#444444';
  ctx.font = '20px Arial';
  ctx.fillText(gameState.lastAction, 600, 600);

  return canvas.toBuffer('image/png');
}

function drawStickFigure(ctx, x, y, color, alive) {
  ctx.strokeStyle = alive ? color : '#999999';
  ctx.lineWidth = 6;
  
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 60, 20, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 40);
  ctx.lineTo(x, y - 10);
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - 25, y - 30);
  ctx.lineTo(x + 25, y - 30);
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x - 20, y + 25);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 20, y + 25);
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
    const gameId = untrustedData.gameId || Date.now().toString();
    
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
        if (gameState.turn === 'player' && !gameState.gameOver) {
          const damage = Math.max(1, gameState.playerStats.attack - gameState.enemyStats.defense);
          gameState.enemyHp = Math.max(0, gameState.enemyHp - damage);
          gameState.lastAction = `You attacked for ${damage} damage!`;
          
          if (gameState.enemyHp <= 0) {
            gameState.gameOver = true;
            gameState.winner = 'player';
          } else {
            gameState.turn = 'enemy';
            // Schedule enemy turn
            setTimeout(() => processEnemyTurn(gameState), 100);
          }
        }
        break;
      
      case 2: // Defend
        if (gameState.turn === 'player' && !gameState.gameOver) {
          gameState.playerStats.defense += 2; // Temporary defense boost
          gameState.lastAction = 'You defend (+2 defense this turn)';
          gameState.turn = 'enemy';
          // Schedule enemy turn
          setTimeout(() => processEnemyTurn(gameState), 100);
        }
        break;
        
      case 3: // Special
        if (gameState.turn === 'player' && !gameState.gameOver) {
          const damage = Math.floor(gameState.playerStats.attack * 1.5);
          gameState.enemyHp = Math.max(0, gameState.enemyHp - damage);
          gameState.lastAction = `You used special attack for ${damage} damage!`;
          
          if (gameState.enemyHp <= 0) {
            gameState.gameOver = true;
            gameState.winner = 'player';
          } else {
            gameState.turn = 'enemy';
            // Schedule enemy turn
            setTimeout(() => processEnemyTurn(gameState), 100);
          }
        }
        break;
        
      case 4: // Reset
        gameState = createDefaultGameState();
        gameStates.set(gameId, gameState);
        break;
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

function processEnemyTurn(gameState) {
  if (gameState.gameOver || gameState.turn !== 'enemy') return;
  
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
  if (gameState.enemyStats.defense > 4) gameState.enemyStats.defense = Math.max(4, gameState.enemyStats.defense - 1);
  
  gameState.turn = 'player';
  
  // Check win conditions
  if (gameState.playerHp <= 0) {
    gameState.gameOver = true;
    gameState.winner = 'enemy';
  }
}

// Serve the main page with Frame metadata
app.get('/', (req, res) => {
  const gameId = req.query.gameId || 'default';
  
  // Read the built index.html
  let html;
  try {
    html = readFileSync(join(__dirname, '../dist/index.html'), 'utf8');
  } catch (error) {
    // Fallback to development version
    html = readFileSync(join(__dirname, '../index.html'), 'utf8');
  }
  
  // Inject Frame metadata with game ID
  html = html.replace(
    '<meta property="fc:frame:image" content="/api/frame/image" />',
    `<meta property="fc:frame:image" content="/api/frame/image?gameId=${gameId}&t=${Date.now()}" />`
  );
  
  html = html.replace(
    '<meta property="og:image" content="/api/frame/image" />',
    `<meta property="og:image" content="/api/frame/image?gameId=${gameId}&t=${Date.now()}" />`
  );

  res.send(html);
});

// API to get game state for the PixiJS game
app.get('/api/game/state/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  let gameState = gameStates.get(gameId);
  
  if (!gameState) {
    gameState = createDefaultGameState();
    gameStates.set(gameId, gameState);
  }
  
  res.json(gameState);
});

app.get('/api/game/state', (req, res) => {
  const gameId = 'default';
  let gameState = gameStates.get(gameId);
  
  if (!gameState) {
    gameState = createDefaultGameState();
    gameStates.set(gameId, gameState);
  }
  
  res.json(gameState);
});

// API to update game state from the PixiJS game
app.post('/api/game/state/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const newState = req.body;
  
  gameStates.set(gameId, newState);
  res.json({ success: true });
});

app.post('/api/game/state', (req, res) => {
  const gameId = 'default';
  const newState = req.body;
  
  gameStates.set(gameId, newState);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Frame server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to play the game`);
});

export default app;