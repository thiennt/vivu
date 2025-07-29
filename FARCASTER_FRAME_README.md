# FarStick - Farcaster Frame Setup

This repository now includes a complete Farcaster Frame setup for the FarStick game, allowing it to be shared and played directly within Farcaster posts.

## 🎯 What is a Farcaster Frame?

Farcaster Frames are interactive applications that can be embedded directly in Farcaster posts. Users can interact with buttons, view images, and perform actions without leaving their Farcaster client.

## 🔧 Implementation Details

### Frame Configuration Files

1. **`index.html`** - Updated with Farcaster Frame meta tags
2. **`public/farcaster-manifest.json`** - Frame manifest configuration
3. **`api/frame.js`** - Serverless function handling frame interactions
4. **`api/webhook.js`** - Webhook handler for frame events
5. **`vercel.json`** - Vercel deployment configuration
6. **`public/frame-image.svg`** - Main frame preview image
7. **`public/battle-frame.svg`** - Battle scene frame image

### Frame Features

- **Main Frame**: Shows game title and "Play Game" + "Battle" buttons
- **Battle Frame**: Interactive battle scene with action buttons
- **Direct Game Link**: Button that opens the full PixiJS game
- **Post Interactions**: Handles button clicks and frame state changes

### Meta Tags Added

```html
<!-- Farcaster Frame Meta Tags -->
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://vivu-game.vercel.app/frame-image.svg" />
<meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
<meta property="fc:frame:button:1" content="🎮 Play Game" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://vivu-game.vercel.app" />
<meta property="fc:frame:button:2" content="⚔️ Battle" />
<meta property="fc:frame:button:2:action" content="post" />
<meta property="fc:frame:post_url" content="https://vivu-game.vercel.app/api/frame" />
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Deploy - the `vercel.json` configuration will handle API routes automatically
3. Update the domain URLs in:
   - `index.html` meta tags
   - `public/farcaster-manifest.json`
   - `api/frame.js` response URLs

### Manual URL Updates

After deployment, update these URLs with your actual domain:

```bash
# Replace "https://vivu-game.vercel.app" with your actual domain in:
- index.html
- public/farcaster-manifest.json  
- api/frame.js
```

## 🎮 Usage

### Sharing in Farcaster

1. Share your deployed URL in a Farcaster post
2. The Frame will automatically appear with the game preview
3. Users can click "🎮 Play Game" to open the full game
4. Users can click "⚔️ Battle" to enter the interactive battle frame

### Frame Interactions

- **Play Game Button**: Opens the full PixiJS game in a new tab
- **Battle Button**: Shows the battle scene frame with action buttons
- **Attack/Defend**: Interactive battle actions (can be extended)

## 🛠️ Customization

### Frame Images

Update the SVG files in `/public/` to match your game's visual style:
- `frame-image.svg` - Main frame preview (1200x630px)
- `battle-frame.svg` - Battle scene preview (1200x630px)

For better quality, consider replacing SVGs with PNG/JPEG images.

### Frame Logic

Modify `api/frame.js` to add more interactive features:
- Game state tracking
- User progress saving
- More complex battle mechanics
- Integration with the main PixiJS game

### Manifest Configuration

Update `public/farcaster-manifest.json` to customize:
- Frame description
- Button labels
- Webhook URLs
- Additional metadata

## 🔍 Testing

### Frame Validation

Use these tools to test your Frame:

1. **Farcaster Frame Validator**: Paste your URL to validate Frame meta tags
2. **Browser DevTools**: Check that all meta tags are present
3. **Social Media Preview**: Test how the Frame appears when shared

### Local Development

For local testing:
1. Use `ngrok` or similar to expose your local server
2. Update URLs in the Frame configuration
3. Test frame interactions before deployment

## 📚 Resources

- [Farcaster Frames Documentation](https://docs.farcaster.xyz/learn/what-is-farcaster/frames)
- [Frame Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

## 🤝 Contributing

To add more Frame features:
1. Update the Frame logic in `api/frame.js`
2. Add new images to `/public/`
3. Update meta tags in `index.html`
4. Test thoroughly before deploying

---

*This Farcaster Frame setup enables the FarStick game to be shared and played directly within the Farcaster ecosystem, providing a seamless social gaming experience.*