import {
  Application,
} from "pixi.js";
import { initAssets } from "./utils/assets";
import { navigation } from "./utils/navigation";
import { getUrlParam } from "./utils/getUrlParams";
import { initDevtools } from "@pixi/devtools";
import { LoadScreen } from "./screens/LoadScreen";
import { HomeScreen } from "./screens/HomeScreen";

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

/** Whimsical fantasy color palette for the game */
export const COLORS = {
  // Primary palette - warm, magical colors
  deepMagenta: 0x7B2C8A,     // Deep purple for headers
  warmCream: 0xFFF8DC,       // Cream for text
  dustyBlue: 0x5F7A8A,       // Muted blue for panels
  shadowGray: 0x4A4A4A,      // Dark gray for shadows
  goldAccent: 0xFFD700,      // Gold for highlights
  
  // Card rarity colors
  common: 0x8E8E8E,          // Gray
  rare: 0x0066CC,            // Blue
  epic: 0x9933CC,            // Purple
  legendary: 0xFF8000,       // Orange
  
  // UI elements
  buttonHover: 0x9A4FB0,     // Lighter purple for hover
  successGreen: 0x4CAF50,    // Green for success
  warningAmber: 0xFFC107,    // Amber for warnings
  dangerRed: 0xF44336,       // Red for danger
  
  // Background variations
  darkBg: 0x2E1A2F,          // Dark purple background
  lightBg: 0xF5F0F5,         // Light background
};

initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Ensure minimum 400px width, center the view
  const gameWidth = Math.max(400, Math.min(800, windowWidth));
  const gameHeight = Math.max(600, windowHeight);
  
  // Center the canvas
  const scale = Math.min(windowWidth / gameWidth, windowHeight / gameHeight);
  
  app.canvas.style.width = `${gameWidth * scale}px`;
  app.canvas.style.height = `${gameHeight * scale}px`;
  app.canvas.style.position = 'absolute';
  app.canvas.style.left = '50%';
  app.canvas.style.top = '50%';
  app.canvas.style.transform = 'translate(-50%, -50%)';
  
  navigation.resize(gameWidth, gameHeight);
}

/** Fire when document visibility changes - lose or regain focus */
function visibilityChange() {
  if (document.hidden) {
    //sound.pauseAll();
    navigation.blur();
  } else {
    //sound.resumeAll();
    navigation.focus();
  }
}

/** Setup app and initialise assets */
async function init() {
  // Initialize app
  await app.init({
    resolution: Math.max(window.devicePixelRatio, 2),
  });

  // Add pixi canvas element (app.canvas) to the document's body
  document.body.appendChild(app.canvas);

  // Whenever the window resizes, call the 'resize' function
  window.addEventListener("resize", resize);

  // Trigger the first resize
  resize();

  // Add a visibility listener, so the app can pause sounds and screens
  document.addEventListener("visibilitychange", visibilityChange);

  // Setup assets bundles (see assets.ts) and start up loading everything in background
  await initAssets();

  // Add a persisting background shared by all screens
  //navigation.setBackground(TiledBackground);

  // Show initial loading screen
  await navigation.showScreen(LoadScreen);

  //Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
  if (getUrlParam("combat") !== null) {
    //await navigation.showScreen(CombatScreen);
  } else {
    await navigation.showScreen(HomeScreen);
  }
}

// Init everything
init();
