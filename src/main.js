import {
    Application, Assets
} from "pixi.js";
import { initDevtools } from '@pixi/devtools';
import { CombatScene } from "./CombatScene";

(async () => {
    // Stuff to do
    const app = new Application();

    await app.init({
        //resizeTo: window,
        width: 400,
        height: window.innerHeight,
        //backgroundAlpha: 0.5,
        backgroundColor: 0x55271A
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

    // //await Assets.init({manifest: '/manifest.json'});
    Assets.add([
        {
            alias: 'warrior',
            src: 'images/warrior.json'
        },
        {
            alias: 'hero',
            src: 'images/hero.json'
        },
        {
            alias: 'stickman',
            src: 'images/stickman.json'
        },
        {
            alias: 'mew',
            src: 'images/mew.json'
        },
        {
            alias: 'box',
            src: 'images/box.json'
        },
        {
            alias: 'effect',
            src: 'images/effect.json'
        },
        {
            alias: 'background',
            src: 'images/background.png'
        },
         {
            alias: 'card',
            src: 'images/card.png'
        }
    ]);

    const combatScene = new CombatScene(app);
    app.stage.addChild(combatScene.view);

    let seconds = 0;

    app.ticker.add((ticker) => {
        combatScene.update(app);

        seconds += (1 / 60) * ticker.deltaTime;
        if(seconds >= 2){
            combatScene.addBullets();
            //combatScene.resetBoxes();
            seconds -= seconds;
        }
    });

    document.body.appendChild(app.canvas);
})();