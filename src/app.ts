import {
  Application,
  Assets,
  Color,
  FillGradient,
  Graphics,
  Sprite,
} from "pixi.js";
import { initAssets } from "./utils/assets";
import { navigation } from "./utils/navigation";
import { getUrlParam } from "./utils/getUrlParams";
import { initDevtools } from "@pixi/devtools";
import { LoadScreen } from "./screens/LoadScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { DungeonScreen } from "./screens/DungeonScreen";
import { CharacterScreen } from "./screens/CharacterScreen";
import { HeroCollectionScreen } from "./screens/HeroCollectionScreen";

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

export const COLORS = {
  // Rarity colors using the new palette
  RARITY: {
    NOVICE: 0x4b3f36, // Shadow Gray
    APPRENTICE: 0x8aa174, // Moss Green
    ADEPT: 0x638599, // Dusty Blue
    EXPERT: 0x8b6f99, // Berry Purple
    MASTER: 0xe3c787, // Pale Gold
    GRANDMASTER: 0xc05c4a, // Clay Red
  },

  // Primary Palette (Earthy & Muted)
  softBrown: "#A38A6D", // main background, borders
  warmCream: "#F5ECD6", // card backgrounds, highlights
  clayRed: "#C05C4A", // character outfits, accent
  dustyBlue: "#638599", // character details, UI highlights
  mossGreen: "#8AA174", // coins, gems, health bars
  paleGold: "#E3C787", // coins, icons, level up
  shadowGray: "#4B3F36", // outlines, text

  // Accent Palette (Playful Elements)
  gentlePink: "#F4B9B2", // hearts, status icons
  mutedTeal: "#7AB8B6", // mana, special effect icons
  pumpkinOrange: "#E29A54", // attack numbers, highlights
  berryPurple: "#8B6F99", // magical effects, rare items

  // Legacy color mappings (updated to new palette)
  gold: "#E3C787", // Pale Gold
  goldDark: "#A38A6D", // Soft Brown
  yellow: "#E29A54", // Pumpkin Orange

  red: "#C05C4A", // Clay Red
  redLight: "#F4B9B2", // Gentle Pink

  white: "#ffffff",
  ivory: "#F5ECD6", // Warm Cream

  gray: "#A38A6D", // Soft Brown
  grayDark: "#4B3F36", // Shadow Gray
  black: "#000000",

  brown: "#A38A6D", // Soft Brown
  brownLight: "#F5ECD6", // Warm Cream

  silver: "#638599", // Dusty Blue
  silverDark: "#4B3F36", // Shadow Gray

  blue: "#638599", // Dusty Blue
  blueLight: "#7AB8B6", // Muted Teal
  blueDark: "#4B3F36", // Shadow Gray
  blueShadow: "#4B3F36", // Shadow Gray

  // Updated pastel colors using accent palette
  pastelPink: "#F4B9B2", // Gentle Pink
  pastelBlue: "#7AB8B6", // Muted Teal
  pastelGreen: "#8AA174", // Moss Green
  pastelYellow: "#E3C787", // Pale Gold
  pastelPurple: "#8B6F99", // Berry Purple
  pastelOrange: "#E29A54", // Pumpkin Orange

  // Crypto-themed colors (updated to fit palette)
  bitcoinOrange: "#E29A54", // Pumpkin Orange
  ethereumBlue: "#7AB8B6", // Muted Teal
  solanaGreen: "#8AA174", // Moss Green

  // Soft card backgrounds
  cardBg: "#F5ECD6", // Warm Cream
  cardBorder: "#A38A6D", // Soft Brown
  cardShadow: "#4B3F3620", // Shadow Gray with transparency
};

initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
  const maxWidth = 500;
  const windowWidth = Math.min(window.innerWidth, maxWidth);
  const windowHeight = window.innerHeight;
  const minWidth = 400;
  const minHeight = 700;

  // Calculate renderer and canvas sizes based on current dimensions
  const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
  const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = windowWidth * scale;
  const height = windowHeight * scale;

  // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
  app.renderer.canvas.style.width = `${windowWidth}px`;
  app.renderer.canvas.style.height = `${windowHeight}px`;
  window.scrollTo(0, 0);

  // Update renderer  and navigation screens dimensions
  app.renderer.resize(width, height);
  navigation.resize(width, height);
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
    background: COLORS.shadowGray,
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
