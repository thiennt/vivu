import { Assets, Container, AnimatedSprite } from 'pixi.js';

export class Box {
    constructor(app, scene) {
        this.app = app;
        this.view = new Container();
        this.scene = scene;
        
        this.boxes = []
        this.addBoxes();

        this.items = {
            crit : [
                { value: 1, rate: 0.35 },
                { value: 2, rate: 0.3 },
                { value: 3, rate: 0.2 },
                { value: 4, rate: 0.1 },
                { value: 5, rate: 0.05 }
            ],
            power: [
                { value: 2, rate: 0.4 },
                { value: 3, rate: 0.3 },
                { value: 4, rate: 0.2 },
                { value: 5, rate: 0.1 }
            ],
            opponent_speed: [
                { value: -2, rate: 0.25 },
                { value: -3, rate: 0.25 },
                { value: 2, rate: 0.25 },
                { value: 3, rate: 0.25 }
            ]
        }
    }

    async addBoxes() {
        let boxSize = 2;
        this.boxSheet = await Assets.load('effect');
        let boxes = this.showRandomBoxes();
        
        for (let i = 0; i < boxSize; i++) {
            let sprite = new AnimatedSprite(boxes[i]);
            //sprite.anchor = 0.5;
            sprite.scale = 0.7;

            let boxSpace = this.app.canvas.width / boxSize;
            let x = (boxSpace - sprite.width)/2 + (i * boxSpace);
            sprite.position.set(x, this.scene.LINE_Y + 100);
            
            sprite.loop = false;
            sprite.interactive = true;
            sprite.cursor = "pointer";
            sprite.buttonMode = true;
            sprite.on("click", this.openBox.bind(this, sprite));

            this.boxes.push(sprite);
            this.view.addChild(sprite);
        }
    }

    showRandomBoxes() {
        let animations = this.boxSheet.animations;
        const boxes = [animations.str, animations.crit, animations.def, animations.hp, animations.agi].sort(() => 0.5 - Math.random());
        return boxes.slice(0, 2);
    }

    openBox(box) {
        // box.textures = this.boxSheet.animations.open;
        // box.gotoAndPlay(0);
        // box.animationSpeed = 0.1;

        this.scene.addBullets();
    }
}

