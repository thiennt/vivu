import { AnimatedSprite, Assets, Graphics } from 'pixi.js';
import { delay } from './util.js';

export class Warrior {
    constructor(app, scene) {
        this.app = app;
        this.scene = scene;
        // The character's state.
        this.state = {
            idle: false,
            fight: false
        };

        this.bullets = [];
        this.stats = {
            attack: 1,  // Number of attacks
            power: 1,   // Power of each attack
            speed: 1    // Speed of the opponent
        }
    }

    async init() {
        this.sheet = await Assets.load('warrior');
        this.sprite = new AnimatedSprite(this.sheet.animations.idle);
        this.sprite.position.set(20, 48);
        this.sprite.width = 60;
        this.sprite.height = 120;
    }

    async fight() {
        if (this.state.fight) return;

        for (let i = 0; i < this.scene.bulletTotal; i++) {
            this.sprite.loop = false;
            this.sprite.animationSpeed = 0.3;
            this.sprite.textures = this.sheet.animations.fight;
            this.sprite.gotoAndPlay(0);

            let bullet = new Graphics()
                .circle(70, 100, 5)
                .fill({
                    color: 0xffffff,
                    alpha: 1
                });

            this.bullets.push(bullet);
            this.scene.addChild(bullet);

            this.scene.bulletTotal -= 1;
            this.state.fight = true;
            await delay(500);
        }
        this.state.fight = false;

        // this.warriorSprite.filters = new BlurFilter({
        //     strength: 1
        // });
    }

    idle() {
        this.sprite.textures = this.sheet.animations.idle;
        this.sprite.gotoAndPlay(0);
    }

    update() {
        if (!this.sprite) return;

        this.fight();

        for (let bullet of this.bullets) {
            bullet.x += 1; // Move the bullet upwards
            if (bullet.x > this.app.canvas.width - 150) {
                this.scene.removeChild(bullet); // Remove bullet if it goes off screen
            }
        }
    }
}
