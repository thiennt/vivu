// Vercel serverless function for Farcaster webhooks
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    
    // Log webhook data for debugging (remove in production)
    console.log('Farcaster webhook received:', JSON.stringify(webhookData, null, 2));
    
    // Handle different webhook types
    if (webhookData.type === 'frame_interaction') {
      // Handle frame interaction webhook
      const { fid, buttonIndex, castHash } = webhookData.data;
      
      // You can add custom logic here, such as:
      // - Tracking user interactions
      // - Storing game progress
      // - Sending notifications
      
      console.log(`User ${fid} clicked button ${buttonIndex} on cast ${castHash}`);
    }
    
    // Always return success for webhooks
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}