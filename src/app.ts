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

initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
  
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
  //window.addEventListener("resize", resize);

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
