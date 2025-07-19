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
            "str": 5,
            "crit": 1,
            "agi": 1
        }

        this.POS_X = 30;
    }

    async init() {
        this.sheet = await Assets.load('hero');
        this.sprite = new AnimatedSprite(this.sheet.animations.idle);
        this.sprite.anchor = 0.5;
        //this.sprite.scale.set(0.6);
        this.sprite.width = 80;
        this.sprite.height = 100;
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;
        this.sprite.position.set(this.POS_X, this.scene.LINE_Y - 50);

        this.addStatsBar();
    }

    position() {
        return this.POS_X + 20;
    }

    addStatsBar() {
        let y = this.scene.LINE_Y - 300;
        let padding = 5;

        let rec = new Graphics()
            .roundRect(padding, y, 190, 100, 10)
            .fill('ffffff')
            //.stroke({ width: 1, color: "ffffff" });
        
        this.scene.addChild(rec);

        this.statsBar = new Text({
            text: this.showStats(),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: { color: 0x000000, alpha: 1 },
                stroke: { color: "ffffff", width: 1 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.statsBar.x = 10 + padding;
        this.statsBar.y = y + padding;
        
        this.scene.addChild(this.statsBar);
    }

    showStats() {
        let statsText = `             HERO \n\n`;
        statsText += `STR: ${this.stats.str} \n`;
        statsText += `CRIT: ${this.stats.crit}% \n`;
        statsText += `AGI: ${this.stats.agi} \n`;

        return statsText;
    }

    updateStats() {
        this.statsBar.text = this.showStats();
    }

    async fight() {
        if (this.state.fight) return;

        for (let i = 0; i < this.scene.bulletTotal; i++) {
            this.sprite.loop = false;
            this.sprite.animationSpeed = 0.3;
            this.sprite.textures = this.sheet.animations.fight;
            this.sprite.gotoAndPlay(0);

            let bullet = new Graphics()
                .circle(this.sprite.x + 35, this.sprite.y - 20, 5)
                .fill({
                    color: 0x000000,
                    alpha: 1
                });

            this.bullets.push(bullet);
            this.scene.addChild(bullet);

            this.scene.bulletTotal -= 1;
            this.state.fight = true;
            await delay(200);
        }
        this.state.fight = false;
        this.idle();

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
