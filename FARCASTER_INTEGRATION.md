# Farcaster Mini App Integration

This document describes the Farcaster mini app integration features added to the FarStick game.

## Features Implemented

### 1. Farcaster Frame Support
- **Frame Meta Tags**: Added proper OpenGraph and Farcaster Frame meta tags to `index.html`
- **Frame Detection**: Automatic detection when running in Farcaster Frame context
- **Frame API**: Basic Frame API structure for handling Frame interactions

### 2. Farcaster Authentication
- **FarcasterService**: Service class for handling Farcaster authentication
- **Sign In/Out**: Support for Farcaster user authentication (currently simulated)
- **User Profile**: Display Farcaster user information (FID, username, display name)

### 3. Social Features
- **Score Sharing**: Ability to share game scores to Farcaster
- **Frame Integration**: Game can be played within Farcaster Frames
- **Social UI**: In-game Farcaster UI panel for social interactions

### 4. Frame Images
- **Dynamic Images**: Frame image generator for welcome, game, and score screens
- **Canvas-based**: Uses HTML Canvas to generate images for Frame responses

## Files Added/Modified

### New Files
- `src/utils/farcaster.ts` - Farcaster service and authentication
- `src/ui/FarcasterUI.ts` - In-game Farcaster UI component
- `src/utils/frameAPI.ts` - Frame API endpoint structure
- `src/utils/frameImages.ts` - Frame image generation utilities

### Modified Files
- `index.html` - Added Farcaster Frame meta tags
- `src/app.ts` - Added Farcaster initialization and Frame context detection
- `src/screens/DungeonScreen.ts` - Integrated Farcaster UI component
- `package.json` - Added Farcaster and web3 dependencies

## Usage

### Frame Context
Access the game with `?frame=true` parameter to simulate Frame context:
```
http://localhost:5173?frame=true
```

### Farcaster UI
The Farcaster UI panel appears in the top-right corner with:
- **Connect FC** button for authentication
- **Share Score** button for sharing achievements
- User profile display when authenticated

### Frame Meta Tags
The application includes proper Frame meta tags for:
- Frame version (`fc:frame`)
- Frame image (`fc:frame:image`)
- Action buttons (`fc:frame:button:*`)
- Post URL (`fc:frame:post_url`)

## Development Notes

### Authentication
Currently using simulated authentication for development. In production, this would integrate with the full Farcaster Auth Kit.

### Frame API
The Frame API structure is prepared for server-side implementation. This would typically be deployed as:
- Serverless functions (Vercel, Netlify)
- API routes (Next.js, Express)
- Lambda functions (AWS)

### Image Generation
Frame images are generated client-side for development. In production, these should be:
- Pre-generated and cached
- Generated server-side
- Served from a CDN

## Integration Testing

1. **Frame Context Detection**: Works correctly with `?frame=true` parameter
2. **UI Integration**: Farcaster UI panel displays properly in game
3. **Authentication Simulation**: Sign-in flow works as expected
4. **Score Sharing**: Share functionality implemented
5. **Frame Images**: Dynamic image generation working

## Next Steps

For production deployment:

1. **Real Authentication**: Integrate with Farcaster Auth Kit or Neynar SDK
2. **Frame API Deployment**: Deploy Frame API endpoints
3. **Image Hosting**: Set up proper image hosting for Frame images
4. **Cast Integration**: Add actual casting to Farcaster
5. **Wallet Integration**: Add wallet connection for web3 features