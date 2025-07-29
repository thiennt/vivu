import { Application } from 'pixi.js';
import { initAssets } from './utils/assets';
import { navigation } from './utils/navigation';
import { getUrlParam } from './utils/getUrlParams';
import { initDevtools } from '@pixi/devtools';
import { LoadScreen } from './screens/LoadScreen';
import { DungeonScreen } from './screens/DungeonScreen';
import { farcasterMiniApp } from './utils/farcaster';
import { FrameImageGenerator } from './utils/frameImages';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

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
        backgroundColor: 0x2D1B69, // Purple background for mini app
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

    // Generate frame images for Farcaster integration
    await FrameImageGenerator.generateAndSaveImages();

    // Track mini app initialization
    farcasterMiniApp.trackMiniAppEvent('app_initialized', {
        context: farcasterMiniApp.getMiniAppContext(),
        timestamp: Date.now()
    });

    // Add a persisting background shared by all screens
    //navigation.setBackground(TiledBackground);

    // Show initial loading screen
    await navigation.showScreen(LoadScreen);

    // Log mini app context and handle Farcaster Frame integration
    const context = farcasterMiniApp.getMiniAppContext();
    console.log('FarStick Mini App Context:', context);

    if (farcasterMiniApp.isFrameContext()) {
        console.log('Running as Farcaster mini app');
        const frameData = farcasterMiniApp.getFrameData();
        console.log('Frame data:', frameData);
        
        // Track frame opening
        farcasterMiniApp.trackMiniAppEvent('frame_opened', frameData);
    }

    //Go to one of the screens if a shortcut is present in url params, otherwise go to game screen
    if (getUrlParam('combat') !== null) {
        //await navigation.showScreen(CombatScreen);
    } else {
        await navigation.showScreen(DungeonScreen);
    }

    // Track game start
    farcasterMiniApp.trackMiniAppEvent('game_started', {
        source: context.isEmbedded ? 'embedded' : 'standalone',
        client: context.client
    });
}

// Init everything
init();
