// Vercel serverless function for Farcaster Frame interactions
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { untrustedData, trustedData } = req.body;
    
    // Validate the frame interaction
    if (!untrustedData || !trustedData) {
      return res.status(400).json({ error: 'Invalid frame data' });
    }

    const buttonIndex = untrustedData.buttonIndex;
    const fid = untrustedData.fid;

    // Handle different button interactions
    let responseHtml = '';
    
    switch (buttonIndex) {
      case 1:
        // Play Game button - redirect to game
        responseHtml = generateFrameResponse({
          image: 'https://vivu-game.vercel.app/frame-image.svg',
          buttons: [
            { label: '🎮 Start Adventure', action: 'link', target: 'https://vivu-game.vercel.app' },
            { label: '🏠 Back to Frame', action: 'post' }
          ],
          postUrl: 'https://vivu-game.vercel.app/api/frame'
        });
        break;
        
      case 2:
        // Battle button - show battle scene
        responseHtml = generateFrameResponse({
          image: 'https://vivu-game.vercel.app/battle-frame.svg',
          buttons: [
            { label: '⚔️ Attack', action: 'post' },
            { label: '🛡️ Defend', action: 'post' },
            { label: '🎮 Play Full Game', action: 'link', target: 'https://vivu-game.vercel.app' }
          ],
          postUrl: 'https://vivu-game.vercel.app/api/frame'
        });
        break;
        
      default:
        // Default response - back to main frame
        responseHtml = generateFrameResponse({
          image: 'https://vivu-game.vercel.app/frame-image.svg',
          buttons: [
            { label: '🎮 Play Game', action: 'link', target: 'https://vivu-game.vercel.app' },
            { label: '⚔️ Battle', action: 'post' }
          ],
          postUrl: 'https://vivu-game.vercel.app/api/frame'
        });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(responseHtml);
    
  } catch (error) {
    console.error('Frame handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateFrameResponse(config) {
  const buttons = config.buttons.map((button, index) => {
    const buttonNumber = index + 1;
    let buttonMeta = `<meta property="fc:frame:button:${buttonNumber}" content="${button.label}" />`;
    
    if (button.action) {
      buttonMeta += `\n    <meta property="fc:frame:button:${buttonNumber}:action" content="${button.action}" />`;
    }
    
    if (button.target) {
      buttonMeta += `\n    <meta property="fc:frame:button:${buttonNumber}:target" content="${button.target}" />`;
    }
    
    return buttonMeta;
  }).join('\n    ');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>FarStick Frame Response</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${config.image}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    ${buttons}
    <meta property="fc:frame:post_url" content="${config.postUrl}" />
    <meta property="og:image" content="${config.image}" />
</head>
<body>
    <p>FarStick Frame Response</p>
</body>
</html>`;
}