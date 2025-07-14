import { AnimatedSprite, Assets, Text } from 'pixi.js';

export class Mew {
    constructor(app, scene) {
        this.app = app;
        this.scene = scene;
        this.state = {
            idle: false,
            fight: false,
            beaten: false
        };

        this.stats = {
            hp: 100,
            currentHP: 100,
            def: 5,
            agi: 2
        };
    }

    async init() {
        this.sheet = await Assets.load('mew');
        this.sprite = new AnimatedSprite(this.sheet.animations.run);
        this.sprite.anchor = 0.5;
        this.sprite.position.set(this.app.canvas.width - 30, this.scene.LINE_Y - 100);
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;

        this.addStatsBar();
        
    }

    addStatsBar() {
        this.hpBar = new Text({
            text: this.showStats(),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: 0xE312A7, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.hpBar.x = this.app.canvas.width - 150;
        this.hpBar.y = 10
        
        this.scene.addChild(this.hpBar);
    }

    showStats() {
        let statsText = `HP: ${this.stats.currentHP} / ${this.stats.hp} \n`
        statsText += `Def: ${this.stats.def} \n`;
        statsText += `Agi: ${this.stats.agi} \n`;

        return statsText;
    }

    async hitBullet() {
        // this.sprite.textures = this.sheet.animations.idle;
        // this.sprite.gotoAndPlay(0);
        //this.state.beaten = true;
        this.sprite.position.x += 1;
        this.stats.currentHP -= this.scene.warrior.stats.str - this.stats.def;
        this.hpBar.text = this.showStats();
        if (this.stats.currentHP <= 0) {
            this.die();
        }
        //await delay(100);
        //this.continueRunning();
    }

    die() {
        this.sprite.textures = this.sheet.animations.idle;
        this.sprite.gotoAndPlay(0);
        this.state.idle = true;
        this.state.beaten = true;
        if (this.state.beaten) {
            this.scene.warriorWin();
        }
    }

    continueRunning() {
        // this.sprite.textures = this.sheet.animations.run;
        // this.sprite.gotoAndPlay(0);
        this.state.beaten = false;
    }

    update() {
        if (!this.sprite) return;
        if (this.state.beaten) return;

        //if (!this.state.beaten) this.sprite.position.x -= 1 * 0.1;
        if (this.sprite.position.x < 20) {
            //this.sprite.position.x = this.app.canvas.width - 150;
            this.scene.warriorLose();
        } else {
            //this.sprite.position.x -= 1 * this.stats.agi / 10;
        }
    }
}
