import { Application, Assets, Sprite } from 'pixi.js';
import { initAssets } from './utils/assets';
import { navigation } from './utils/navigation';
import { getUrlParam } from './utils/getUrlParams';
import { initDevtools } from '@pixi/devtools';
import { LoadScreen } from './screens/LoadScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DungeonScreen } from './screens/DungeonScreen';
import { CharacterScreen } from './screens/CharacterScreen';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

export const COLORS = {
    FRAME_BORDER: 0x46483f,
    FRAME_BACKGROUND: 0xeaf2d5,
    FRAME_LABEL: 0x414d27,
    FRAME_TEXT: 0x000000,
    FRAME_LABEL_HIGHLIGHTED: 0x143f03,
    TAB_PANEL_HIGHLIGHTED: 0x99b35b,
    TAB_PANEL_BORDER_SELECTED: 0x2e351b,
    TAB_PANEL_BORDER_UNSELECTED: 0x474840,
    TAB_PANEL_NOT_HIGHLIGHTED: 0xeff8d9,
    PANEL_BOLD: 0xC4D5B2,
    RARITY: {
        NOVICE: 0xffffff,
        APPRENTICE: 0x51ec22,
        ADEPT: 0x291aee,
        EXPERT: 0xf014cb,
        MASTER: 0xeba40d,
        GRANDMASTER: 0x940808,
    },
    BUTTON: 0x3868ec,
    BUTTON_OK: 0x73a370,
    BUTTON_CANCEL: 0xba4b45,
};

// battle screne
// border: 000000
// background: c7e0b7


initDevtools({ app });

/** Set up a resize function for the app */
function resize() {
    const maxWidth = 500;
    const windowWidth = Math.min(window.innerWidth - 10, maxWidth);
    const windowHeight = window.innerHeight - 10;
    const minWidth = 375;
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
        background: 'C4D5B2',
    });

    // Add pixi canvas element (app.canvas) to the document's body
    document.body.appendChild(app.canvas);

    // Whenever the window resizes, call the 'resize' function
    window.addEventListener('resize', resize);

    // Trigger the first resize
    resize();

    // Add a visibility listener, so the app can pause sounds and screens
    document.addEventListener('visibilitychange', visibilityChange);

    // Setup assets bundles (see assets.ts) and start up loading everything in background
    await initAssets();

    // Add a persisting background shared by all screens
    //navigation.setBackground(TiledBackground);

    // Show initial loading screen
    await navigation.showScreen(LoadScreen);

    //Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
    if (getUrlParam('combat') !== null) {
        //await navigation.showScreen(CombatScreen);
    } else {
        await navigation.showScreen(DungeonScreen);
    }
}

// Init everything
init();
