import {
    Application, Graphics, Assets, Container,
    AnimatedSprite, BlurFilter
} from "pixi.js";
import { initDevtools } from '@pixi/devtools';
import { CombatScene } from "./CombatScene";

(async () => {
    // Stuff to do
    const app = new Application();

    await app.init({
        resizeTo: window,
        backgroundAlpha: 0.5
    });

    initDevtools({ app });
    app.canvas.style.position = "absolute";

    const WIDTH = app.canvas.width;
    const HEIGHT = app.canvas.height;

    var rectY = HEIGHT / 6;

    // //await Assets.init({manifest: '/manifest.json'});
    Assets.add([
        {
            alias: 'warrior',
            src: 'images/warrior.json'
        }, {
            alias: 'mew',
            src: 'images/mew.json'
        }
    ]);

    const combatScene = new CombatScene(app);
    app.stage.addChild(combatScene.view);

    // const bullets = [];
    // function moveReactangle() {
    //     const bullet = new Graphics()
    //         .circle(50, 42, 5)
    //         .fill({
    //             color: 0xffffff,
    //             alpha: 1
    //         });
    //     bullets.push(bullet);
    //     combatContainer.addChild(bullet);

    //     warriorSprite.filters = new BlurFilter({
    //         strength: 1
    //     });
    // }
    // const warriorSheet = await Assets.load('warrior');
    // const warriorSprite = new AnimatedSprite(warriorSheet.animations.fight);
    // warriorSprite.play();
    // warriorSprite.animationSpeed = 0.13;
    // combatContainer.addChild(warriorSprite);

    // warriorSprite.interactive = true;
    // warriorSprite.cursor = "pointer";
    // warriorSprite.on("pointerdown", moveReactangle);

    // const mewSheet = await Assets.load('mew');
    // const mewSprite = new AnimatedSprite(mewSheet.animations.run);
    // mewSprite.position.set(combatContainer.width - 50, rectY);
    // mewSprite.play();
    // mewSprite.animationSpeed = 0.13;
    // combatContainer.addChild(mewSprite);

    // app.ticker.add(() => {
    //     //moveReactangle(combatContainer);
    //     for (let bullet of bullets) {
    //         bullet.x += 1; // Move the bullet upwards
    //         if (bullet.x > WIDTH) {
    //             combatContainer.removeChild(bullet); // Remove bullet if it goes off screen
    //         }
    //     }
    // });

    document.body.appendChild(app.canvas);
})();