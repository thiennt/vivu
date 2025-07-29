#!/bin/bash

# Simple test script for Farcaster Frame functionality

echo "🧪 Testing Farcaster Frame Integration..."

# Test 1: Frame image endpoint
echo "📸 Testing frame image generation..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/frame/image)
if [ "$response" = "200" ]; then
    echo "✅ Frame image endpoint working"
else
    echo "❌ Frame image endpoint failed (HTTP $response)"
    exit 1
fi

# Test 2: Frame action endpoint (Attack)
echo "⚔️ Testing attack action..."
response=$(curl -s -X POST http://localhost:3001/api/frame/action \
  -H "Content-Type: application/json" \
  -d '{"untrustedData": {"buttonIndex": 1, "gameId": "test456"}}')

if echo "$response" | grep -q '"type":"frame"'; then
    echo "✅ Attack action working"
else
    echo "❌ Attack action failed"
    exit 1
fi

# Test 3: Frame action endpoint (Defend)
echo "🛡️ Testing defend action..."
response=$(curl -s -X POST http://localhost:3001/api/frame/action \
  -H "Content-Type: application/json" \
  -d '{"untrustedData": {"buttonIndex": 2, "gameId": "test789"}}')

if echo "$response" | grep -q '"type":"frame"'; then
    echo "✅ Defend action working"
else
    echo "❌ Defend action failed"
    exit 1
fi

# Test 4: Frame metadata
echo "🏷️ Testing frame metadata..."
response=$(curl -s http://localhost:3001/)
if echo "$response" | grep -q 'fc:frame'; then
    echo "✅ Frame metadata present"
else
    echo "❌ Frame metadata missing"
    exit 1
fi

echo ""
echo "🎉 All Frame tests passed!"
echo "🚀 Ready for Farcaster deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel/Railway/Render"
echo "2. Test with Farcaster Frame validator"
echo "3. Share in Farcaster client"