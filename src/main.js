import {
    Application, Assets
} from "pixi.js";
import { initDevtools } from '@pixi/devtools';
import { Menu } from "./Menu";

(async () => {
    // Stuff to do
    const app = new Application();

    await app.init({
        //resizeTo: window,
        width: 400,
        height: window.innerHeight,
        //backgroundAlpha: 0.5,
        backgroundColor: "E6E6E6"
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
            alias: 'demon',
            src: 'images/demon.json'
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
            alias: 'skills',
            src: 'images/skills.json'
        },
        {
            alias: 'background',
            src: 'images/background.png'
        },
        {
            alias: 'card',
            src: 'images/card.png'
        },
        {
            alias: 'boom',
            src: 'images/boom.png'
        },
        {
            alias: 'menu',
            src: 'images/menu.json'
        }
    ]);

    const menu = new Menu(app);
    await menu.loadAssets();
    menu.init();
    app.stage.addChild(menu.view);

    document.body.appendChild(app.canvas);
})();