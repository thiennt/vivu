import { AnimatedSprite, Assets, Graphics, Text } from 'pixi.js';
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
            str: 10,
            crt: 1,
            hit: 1
        }
    }
    

    async init() {
        this.sheet = await Assets.load('stickman');
        this.sprite = new AnimatedSprite(this.sheet.animations.idle);
        this.sprite.anchor = 0.5;
        this.sprite.scale.set(0.6);
        this.sprite.position.set(30, this.scene.LINE_Y - 80);

        this.addStatsBar();
    }

    addStatsBar() {
        this.statBar = new Text({
            text: this.showStats(),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: 0x16D1E3, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.statBar.x = 20;
        this.statBar.y = 10
        
        this.scene.addChild(this.statBar);
    }

    showStats() {
        let statsText = `STR: ${this.stats.str} \n`;
        statsText += `CRT: ${this.stats.crt} \n`;
        statsText += `HIT: ${this.stats.hit} \n`;

        return statsText;
    }

    async fight() {
        if (this.state.fight) return;

        for (let i = 0; i < this.scene.bulletTotal; i++) {
            this.sprite.loop = false;
            this.sprite.animationSpeed = 0.3;
            this.sprite.textures = this.sheet.animations.fight;
            this.sprite.gotoAndPlay(0);

            let bullet = new Graphics()
                .circle(this.sprite.x + 30, this.sprite.y - 10, 5)
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
