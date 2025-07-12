import {
    Application, Assets
} from "pixi.js";
import { initDevtools } from '@pixi/devtools';
import { CombatScene } from "./CombatScene";
import { BoxScene } from "./BoxScene";

(async () => {
    // Stuff to do
    const app = new Application();

    await app.init({
        //resizeTo: window,
        width: 400,
        height: window.innerHeight,
        backgroundAlpha: 0.5
    });

    // Get canvas dimensions
    const canvasWidth = app.canvas.width;
    const canvasHeight = app.canvas.height;

    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate offsets
    const offsetX = (windowWidth - canvasWidth) / 2;
    const offsetY = (windowHeight - canvasHeight) / 2;

    // Apply offsets
    app.canvas.style.position = 'absolute';
    app.canvas.style.left = `${offsetX}px`;
    app.canvas.style.top = `${offsetY}px`;

    initDevtools({ app });
    app.canvas.style.position = "absolute";

    // //await Assets.init({manifest: '/manifest.json'});
    Assets.add([
        {
            alias: 'warrior',
            src: 'images/warrior.json'
        }, {
            alias: 'mew',
            src: 'images/mew.json'
        }, {
            alias: 'box',
            src: 'images/box.json'
        }
    ]);

    const combatScene = new CombatScene(app);
    const boxScene = new BoxScene(app); 
    app.stage.addChild(combatScene.view);
    app.stage.addChild(boxScene.view);

    app.ticker.add((ticker) => {
        combatScene.update(app);
    });

    document.body.appendChild(app.canvas);
})();