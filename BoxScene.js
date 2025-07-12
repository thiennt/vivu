import { Assets, Container, AnimatedSprite } from 'pixi.js';

export class BoxScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        
        this.boxes = []
        this.addBoxes();

        this.items = {
            num_of_attacks : [
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
        let boxSize = 3;
        this.boxSheet = await Assets.load('box');

        for (let i = 0; i < boxSize; i++) {
            let sprite = new AnimatedSprite(this.boxSheet.animations.close);
            let boxSpace = this.app.canvas.width / boxSize;
            let x = (boxSpace - sprite.width)/2 + (i * boxSpace);
            sprite.position.set(x, 200);
            
            sprite.loop = false;
            sprite.interactive = true;
            sprite.cursor = "pointer";
            sprite.buttonMode = true;
            sprite.on("click", this.openBox.bind(this, sprite));

            this.boxes.push(sprite);
            this.view.addChild(sprite);
        }
    }

    openBox(box) {
        box.textures = this.boxSheet.animations.open;
        box.gotoAndPlay(0);
        box.animationSpeed = 0.1;
    }
}

