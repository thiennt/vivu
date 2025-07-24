import { AnimatedSprite, Assets, Graphics, Text } from 'pixi.js';
import { delay } from './util.js';
import { Bullet } from './Bullet.js';

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
            "atk": 5,
            "crit": 20,
            "agi": 1
        }
    }

    init() {
        // this.sheet = await Assets.load('stickman');
        // this.sprite = new AnimatedSprite(this.sheet.animations.idle);
        this.sheet = this.scene.heroSheet;
        this.sprite = this.scene.heroSprite;
        this.sprite.anchor = 0.5;
        //this.sprite.scale.set(0.6);
        // this.sprite.width = 40;
        // this.sprite.height = 80;
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;
        this.sprite.position.set(40, this.scene.LINE_Y - 42);

        this.addStatsBar();
    }

    addStatsBar() {
        let y = this.scene.LINE_Y - 400;
        let padding = 5;

        let rec = new Graphics()
            .roundRect(padding, y, 190, 200, 10)
            .fill('ffffff')
            //.stroke({ width: 1, color: "ffffff" });
        
        this.scene.addChild(rec);
        
        let iconX = 10 + padding;

        let atkIcon = this.addIcon("atk", iconX, y + 50);
        this.scene.addChild(atkIcon);

        let critIcon = this.addIcon("crit", iconX, y + 87);
        this.scene.addChild(critIcon);

        let agiIcon = this.addIcon("agi", iconX, y + 122);
        this.scene.addChild(agiIcon);

        this.statsBar = new Text({
            text: this.showStats(),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: { color: 0x000000, alpha: 1 },
                stroke: { color: 0x000000, width: 1 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.statsBar.x = iconX + 15;
        this.statsBar.y = y + padding;
        this.scene.addChild(this.statsBar);
    }

    addIcon(name, x, y) {
        let animations = this.scene.skillsSheet.animations;
        let icon = new AnimatedSprite(animations[name]);
        icon.anchor = 0.5;
        icon.width = 14;
        icon.height = 14;
        icon.position.set(x, y);

        return icon;
    }

    showStats() {
        let statsText = `HERO \n\n`;
        statsText += `ATK: ${this.stats.atk} \n\n`;
        statsText += `CRIT: ${this.stats.crit}% \n\n`;
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
            this.sprite.animationSpeed = 3;
            this.sprite.textures = this.sheet.animations.palm;
            this.sprite.gotoAndPlay(0);

            let bullet = new Bullet(this.app, this.scene);
            this.bullets.push(bullet);
            this.scene.addChild(bullet.sprite);

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
            bullet.move(); // Move the bullet upwards
            if (bullet.sprite.x > this.app.canvas.width - 150) {
                this.scene.removeChild(bullet.sprite); // Remove bullet if it goes off screen
            }
        }
    }
}
