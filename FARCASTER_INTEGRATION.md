# Farcaster Mini App Integration

This document describes the Farcaster mini app implementation for FarStick, converting the standalone PixiJS game into a proper Farcaster mini app.

## 🎯 Mini App Features

### Architecture
- **FarcasterMiniAppService**: Comprehensive service managing mini app lifecycle
- **Context Detection**: Automatic detection of embedded vs standalone modes
- **Auto-Authentication**: Seamless user authentication in Farcaster context
- **Frame Communication**: PostMessage API integration with parent frames

### Social Features
- **Share Score**: Share achievements directly to Farcaster
- **Cast Game**: Create casts about game progress
- **Analytics**: Track user interactions and game events
- **User Profiles**: Display Farcaster user information (FID, username, avatar)

### UI/UX Optimizations
- **Adaptive Layout**: Different layouts for embedded vs standalone
- **Mobile-First**: Touch-optimized controls for Farcaster mobile app
- **Context Indicators**: Clear visual feedback for current mode
- **Responsive Design**: Scales properly across different screen sizes

## 🔧 Implementation Details

### Files Structure
```
src/
├── utils/
│   ├── farcaster.ts          # Mini app service and authentication
│   ├── frameImages.ts        # Dynamic Frame image generation
│   └── frameAPI.ts           # Frame API endpoint structure
├── ui/
│   └── FarcasterUI.ts        # Mini app UI component
├── app.ts                    # App initialization with mini app support
└── screens/
    └── DungeonScreen.ts      # Game screen with mini app integration

public/
└── farcaster.json            # Mini app manifest
```

### Configuration Files

#### Mini App Manifest (`public/farcaster.json`)
```json
{
  "name": "FarStick",
  "description": "An epic dungeon adventure game built as a Farcaster mini app",
  "version": "1.0.0",
  "icon": "/icon-192.png",
  "permissions": ["cast", "profile", "social_graph"],
  "category": "game"
}
```

#### Frame Meta Tags (`index.html`)
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://vivu-game.vercel.app/frame-welcome.png" />
<meta property="fc:frame:button:1" content="🎮 Play Game" />
<meta property="fc:frame:button:2" content="📊 View Leaderboard" />
```

## 🚀 Usage & Testing

### Development Testing

#### Standalone Mode
```
http://localhost:5173
```
- Shows "🌐 Standalone Mode" indicator
- Manual authentication required
- Full web features available

#### Embedded Mode (Mini App)
```
http://localhost:5173?embedded=true&fid=123
```
- Shows "🎮 Mini App Mode" indicator
- Auto-authentication with provided FID
- Enhanced social features (Share + Cast buttons)
- Analytics tracking enabled

### Context Detection
The mini app automatically detects its environment:
- **URL Parameters**: `embedded=true`, `frame=true`, `fid=*`
- **User Agent**: Farcaster/Warpcast detection
- **Parent Window**: Iframe detection

### Authentication Flow
1. **Embedded Context**: Auto-authenticate using Frame data
2. **Standalone Context**: Manual sign-in with Farcaster Auth Kit
3. **User Profile**: Display FID, username, display name, avatar

## 📱 Mobile Optimization

### Touch Controls
- Prevent zoom gestures in embedded mode
- Optimized touch event handling
- Responsive canvas scaling

### Frame Communication
```javascript
// Send message to parent Frame
window.parent.postMessage({
  type: 'miniapp-share',
  data: { score, level, text }
}, '*');

// Listen for Frame actions
window.addEventListener('message', (event) => {
  if (event.data.type === 'frame-action') {
    handleFrameAction(event.data);
  }
});
```

## 🔍 Analytics & Events

The mini app tracks user interactions:
- `app_initialized`: Mini app startup
- `user_authenticated`: User sign-in
- `frame_opened`: Frame context detected
- `game_started`: Game launch
- `score_shared`: Score sharing
- `game_cast`: Game casting
- `ui_shown`: UI interactions

## 🚀 Production Deployment

### Requirements
1. **Domain Setup**: Deploy to a publicly accessible domain
2. **HTTPS**: Required for Frame embedding
3. **Frame API**: Server-side endpoints for Frame actions
4. **Image Hosting**: CDN for Frame images
5. **Real Authentication**: Production Farcaster Auth Kit integration

### Deployment Checklist
- [ ] Update Frame URLs in meta tags to production domain
- [ ] Deploy Frame API endpoints (`/api/frame`, `/api/share`)
- [ ] Set up image hosting for Frame images
- [ ] Configure Farcaster Auth Kit with production keys
- [ ] Test in actual Farcaster clients (Warpcast, etc.)
- [ ] Submit to Farcaster mini app directory

### Frame API Structure
```
POST /api/frame
- Handle Frame button interactions
- Generate response with new image/buttons
- Process user actions (play, share, etc.)

POST /api/share  
- Process score sharing requests
- Create Farcaster casts
- Return success/error responses
```

## 🎮 Game Integration

### Score Tracking
```javascript
// Update game stats in mini app UI
farcasterUI.updateGameStats(score, level);

// Share score to Farcaster
await farcasterMiniApp.shareScore({
  score: 1500,
  level: 8,
  gameStats: { playtime: 120000 }
});
```

### Event Tracking
```javascript
// Track game events
farcasterMiniApp.trackMiniAppEvent('level_completed', {
  level: 3,
  score: 750,
  time: 45000
});
```

## 🔒 Security & Privacy

### Data Handling
- Minimal user data collection
- No sensitive information stored locally
- Secure communication with parent frames
- Respect Farcaster privacy guidelines

### Frame Security
- Validate all Frame messages
- Sanitize user inputs
- Use HTTPS for all communications
- Implement proper CORS policies

## 🆕 What's New vs Original Implementation

| Feature | Original | Mini App |
|---------|----------|----------|
| **Architecture** | Standalone web game | Farcaster-first mini app |
| **Authentication** | Optional Farcaster integration | Context-aware auto-auth |
| **UI Layout** | Fixed design | Adaptive (embedded vs standalone) |
| **Social Features** | Basic sharing | Full cast/share/analytics |
| **Mobile Support** | Standard web | Farcaster mobile optimized |
| **Frame Support** | Basic meta tags | Full Frame communication |
| **Analytics** | None | Comprehensive event tracking |
| **Context** | Single mode | Dual mode (embedded/standalone) |

The mini app maintains full backward compatibility while adding comprehensive Farcaster ecosystem integration.