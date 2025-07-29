# FarStick Battle Game - Farcaster Frame

This is a stick figure battle game that has been converted into a Farcaster Frame mini app.

## What is a Farcaster Frame?

Farcaster Frames are interactive applications that can be embedded in Farcaster posts. Users can interact with them directly through buttons without leaving the social feed.

## Game Features

- **Turn-based Combat**: Battle against an AI enemy using Attack, Defend, and Special moves
- **RPG Stats**: Each character has HP, Attack, Defense, Critical chance, and Agility
- **Visual Feedback**: See your stick figure warrior battle in real-time
- **Frame Optimized**: Designed specifically for the 1200x630 Frame format

## How to Play

1. **⚔️ Attack**: Deal damage based on your attack stat minus enemy defense
2. **🛡️ Defend**: Temporarily boost your defense for the next enemy attack
3. **💨 Special**: Perform a powerful attack dealing 1.5x normal damage
4. **🔄 Reset**: Start a new battle

## Game Mechanics

- **Damage Calculation**: `max(1, attacker_attack - defender_defense)`
- **Defense Boost**: Defending adds +2 defense for one turn
- **Special Attack**: Deals 150% of normal attack damage
- **AI Behavior**: Enemy has 70% chance to attack, 30% chance to defend

## Technical Implementation

### Frame Structure
- **Image Endpoint**: `/api/frame/image` - Generates game state visualization
- **Action Endpoint**: `/api/frame/action` - Handles button interactions
- **Frame Metadata**: Proper Open Graph and Farcaster Frame meta tags

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
# Set server/frame.js as the API handler
```

#### Option 2: Railway/Render
```bash
npm install
npm run build:frame
```

#### Option 3: Self-hosted
```bash
npm install
npm run build
npm run start:frame
```

## Frame Testing

You can test the Frame functionality by:

1. **Local Testing**: Visit `http://localhost:3001` after running `npm run start:frame`
2. **Frame Validator**: Use Farcaster Frame validation tools
3. **Farcaster Client**: Post the Frame URL in a Farcaster client

## Game State Management

The game uses in-memory storage for simplicity. For production deployment, consider:
- Redis for session storage
- Database for persistent game history
- WebSocket for real-time multiplayer features

## Development

```bash
# Install dependencies
npm install

# Build assets
npm run assets

# Build the application
npm run build

# Start Frame server
npm run start:frame

# Development mode (both game and frame server)
npm run start:dev
```

## Frame Metadata

The Frame includes proper metadata for Farcaster integration:
- `fc:frame` - Frame version specification
- `fc:frame:image` - Dynamic game state image
- `fc:frame:button:*` - Interactive buttons
- `fc:frame:post_url` - Action handler endpoint
- Open Graph metadata for social sharing

## Contributing

When adding new features:
1. Maintain Frame image dimensions (1200x630)
2. Keep button count ≤ 4 (Frame limitation)
3. Ensure game state is stateless for scalability
4. Test Frame validation before deployment