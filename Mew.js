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

        this.totalHP = 100;
        this.currentHP = this.totalHP;
    }

    async init() {
        this.sheet = await Assets.load('mew');
        this.sprite = new AnimatedSprite(this.sheet.animations.run);
        this.sprite.position.set(this.app.canvas.width - 150, 30);
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;

        this.addHPBar();
    }

    addHPBar() {
        this.hpBar = new Text({
            text: 'HP: ' + this.currentHP + ' / ' + this.totalHP,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: 0xF3071A, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.hpBar.x = this.app.canvas.width - 150;
        this.hpBar.y = 10
    }

    async hitBullet() {
        // this.sprite.textures = this.sheet.animations.idle;
        // this.sprite.gotoAndPlay(0);
        //this.state.beaten = true;
        this.sprite.position.x += 2;
        this.currentHP -= 10;
        this.hpBar.text = 'HP: ' + this.currentHP + ' / ' + this.totalHP;
        if (this.currentHP <= 0) {
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
            this.sprite.position.x -= 1 * 0.1;
        }
    }
}
