#!/usr/bin/env node

// Simple test script to validate Farcaster Frame setup
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testFrameSetup() {
  console.log('🧪 Testing Farcaster Frame Setup...\n');

  const tests = [
    testHtmlMetaTags,
    testManifestExists,
    testApiEndpoints,
    testFrameImages,
    testVercelConfig
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All Farcaster Frame setup tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the setup.');
  }
}

function testHtmlMetaTags() {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const requiredMetaTags = [
    'fc:frame',
    'fc:frame:image',
    'fc:frame:button:1',
    'fc:frame:post_url'
  ];
  
  requiredMetaTags.forEach(tag => {
    if (!html.includes(`property="${tag}"`)) {
      throw new Error(`Missing meta tag: ${tag}`);
    }
  });
}

function testManifestExists() {
  const manifestPath = path.join(__dirname, 'public', 'farcaster-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('farcaster-manifest.json not found');
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const requiredFields = ['version', 'name', 'image', 'buttons', 'postUrl'];
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      throw new Error(`Missing manifest field: ${field}`);
    }
  });
}

function testApiEndpoints() {
  const framePath = path.join(__dirname, 'api', 'frame.js');
  const webhookPath = path.join(__dirname, 'api', 'webhook.js');
  
  if (!fs.existsSync(framePath)) {
    throw new Error('api/frame.js not found');
  }
  
  if (!fs.existsSync(webhookPath)) {
    throw new Error('api/webhook.js not found');
  }
}

function testFrameImages() {
  const mainImagePath = path.join(__dirname, 'public', 'frame-image.svg');
  const battleImagePath = path.join(__dirname, 'public', 'battle-frame.svg');
  
  if (!fs.existsSync(mainImagePath)) {
    throw new Error('frame-image.svg not found');
  }
  
  if (!fs.existsSync(battleImagePath)) {
    throw new Error('battle-frame.svg not found');
  }
}

function testVercelConfig() {
  const vercelPath = path.join(__dirname, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    throw new Error('vercel.json not found');
  }
  
  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  
  if (!config.functions || !config.functions['api/frame.js']) {
    throw new Error('vercel.json missing api/frame.js function config');
  }
}

// Run tests
testFrameSetup();