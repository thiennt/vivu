# FarStick Battle Game - Farcaster Frame Integration

This project integrates the existing PixiJS stick figure battle game as a Farcaster Frame mini app, allowing users to play directly within Farcaster social feeds.

## 🎮 Game Features

**Turn-Based Combat System**
- ⚔️ **Attack**: Deal damage based on `max(1, attack - enemy_defense)`
- 🛡️ **Defend**: Temporary +2 defense boost for one turn
- 💨 **Special**: 150% damage special attack
- 🔄 **Reset**: Start a new battle

**RPG-Style Stats**
- ❤️ HP: Health points (Player: 16, Enemy: 15)
- ⚔️ Attack: Damage dealt (Player: 5, Enemy: 6)
- 🛡️ Defense: Damage reduction (Player: 5, Enemy: 4)
- ⭐ Critical: Critical hit chance (20% for both)
- 🏃 Agility: Speed/evasion (Player: 3, Enemy: 2)

## 🚀 How It Works

### Dual Mode Operation
The game works in two modes:
1. **Standalone Web App**: Traditional PixiJS game with full interactivity
2. **Farcaster Frame**: Turn-based combat via Frame buttons

### Frame Integration
- **Frame Detection**: Automatically detects Frame context via URL parameters or user agent
- **State Synchronization**: Syncs game state between PixiJS game and Frame API
- **Visual Feedback**: Frame images generated in real-time showing battle state
- **Button Actions**: Frame buttons control combat actions

### Technical Architecture

**Client Side (PixiJS)**
- `src/utils/FrameIntegration.ts`: Handles Frame detection and state sync
- `src/ui/BattleScene.ts`: Main game scene with Frame integration
- Frame metadata in `index.html` for proper Farcaster embedding

**Server Side (Frame API)**
- `api/frame.js`: Express server handling Frame requests
- `/api/frame/image`: Generates dynamic game state images (1200x630)
- `/api/frame/action`: Processes button interactions
- `/api/game/state`: RESTful API for game state management

## 🛠️ Development

### Running Locally
```bash
# Install dependencies
npm install

# Start development (both PixiJS game and Frame server)
npm run start:dev

# Or run separately:
npm run start       # PixiJS game (Vite dev server)
npm run start:frame # Frame API server
```

### Building for Production
```bash
npm run build        # Build PixiJS game
npm run build:frame  # Build and start Frame server
```

### Testing Frame Functionality
```bash
# Test Frame image generation
curl http://localhost:3001/api/frame/image

# Test Frame action
curl -X POST http://localhost:3001/api/frame/action \
  -H "Content-Type: application/json" \
  -d '{"untrustedData":{"buttonIndex":1,"gameId":"test"}}'

# Test game state API
curl http://localhost:3001/api/game/state
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel deploy

# Set environment variables if needed
vercel env add PORT
```

The included `vercel.json` configuration:
- Routes Frame API requests to `api/frame.js`
- Serves the built PixiJS game as static files
- Handles both Frame and web app requests

### Other Platforms
The game can be deployed on any platform supporting Node.js:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS/Google Cloud

## 🔧 Configuration

### Frame Metadata
Frame behavior is controlled by meta tags in `index.html`:
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="/api/frame/image" />
<meta property="fc:frame:button:1" content="⚔️ Attack" />
<meta property="fc:frame:button:2" content="🛡️ Defend" />
<meta property="fc:frame:button:3" content="💨 Special" />
<meta property="fc:frame:button:4" content="🔄 Reset" />
<meta property="fc:frame:post_url" content="/api/frame/action" />
```

### Game State Structure
```javascript
{
  playerHp: 16,
  playerMaxHp: 16,
  enemyHp: 15,
  enemyMaxHp: 15,
  playerStats: { hp: 16, attack: 5, defense: 5, critical: 20, agility: 3 },
  enemyStats: { hp: 15, attack: 6, defense: 4, critical: 20, agility: 2 },
  turn: 'player',
  gameOver: false,
  winner: null,
  lastAction: 'Battle begins!',
  battlePhase: 'combat'
}
```

## 🎯 Frame Validation

The Frame implementation follows Farcaster Frame specifications:
- ✅ Proper Frame metadata format
- ✅ 1200x630 image dimensions
- ✅ Interactive button actions
- ✅ State persistence across interactions
- ✅ Error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test Frame functionality
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.