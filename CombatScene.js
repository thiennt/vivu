import { Graphics, Container, Assets, AnimatedSprite } from 'pixi.js';

export class CombatScene {
    constructor(app) {
        this.view = new Container();
        this.addLine(app);
        this.addWarrior(app);
        this.addMew(app);
    }

    addLine(app) {
        const line = new Graphics()
            .moveTo(0, 135)
            .lineTo(app.canvas.width, 135)
            .stroke({
                color: 0x55ffaa
            });

        this.view.addChild(line);
    }

    async addWarrior(app) {
        const warriorSheet = await Assets.load('warrior');
        this.warriorSprite = new AnimatedSprite(warriorSheet.animations.fight);
        this.warriorSprite.position.set(20, 48);
        this.warriorSprite.width = 60;
        this.warriorSprite.height = 120;
        this.warriorSprite.play();
        this.warriorSprite.animationSpeed = 0.13;
        
        this.view.addChild(this.warriorSprite);

        this.warriorSprite.interactive = true;
        this.warriorSprite.cursor = "pointer";
        //this.warriorSprite.on("pointerdown", moveReactangle);
    }

    async addMew(app) {
        const mewSheet = await Assets.load('mew');
        this.mewSprite = new AnimatedSprite(mewSheet.animations.run);
        //this.mewSprite.width = 120;
        //this.mewSprite.height = 120;
        this.mewSprite.position.set(app.canvas.width - 150, 30);
        this.mewSprite.play();
        this.mewSprite.animationSpeed = 0.13;
        this.view.addChild(this.mewSprite);
    }
}
