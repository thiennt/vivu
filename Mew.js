import { AnimatedSprite, Assets, Graphics } from 'pixi.js';
import { delay } from './util.js';

export class Mew {
    constructor(app, scene) {
        this.app = app;
        this.scene = scene;
        this.state = {
            idle: false,
            fight: false,
            beaten: false
        };
    }

    async init() {
        this.sheet = await Assets.load('mew');
        this.sprite = new AnimatedSprite(this.sheet.animations.run);
        this.sprite.position.set(this.app.canvas.width - 150, 30);
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;
    }

    async hitBullet() {
        // this.sprite.textures = this.sheet.animations.idle;
        // this.sprite.gotoAndPlay(0);
        //this.state.beaten = true;
        this.sprite.position.x += 2;
        //await delay(100);
        //this.continueRunning();
    }

    continueRunning() {
        // this.sprite.textures = this.sheet.animations.run;
        // this.sprite.gotoAndPlay(0);
        this.state.beaten = false;
    }

    update() {
        if (!this.sprite) return;

        //if (!this.state.beaten) this.sprite.position.x -= 1 * 0.1;
        if (this.sprite.position.x < 20) {
            //this.sprite.position.x = this.app.canvas.width - 150;
        } else {
            this.sprite.position.x -= 1 * 0.1;
        }
    }
}
