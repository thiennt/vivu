import { AnimatedSprite, Assets, Text, Graphics } from 'pixi.js';

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
            "hp": 15,
            "currentHP": 15,
            "def": 4,
            "agi": 2
        };
    }

    async init() {
        this.sheet = await Assets.load('mew');
        this.sprite = new AnimatedSprite(this.sheet.animations.run);
        this.sprite.anchor = 0.5;
        this.sprite.width = 120;
        this.sprite.height = 140;
        this.sprite.position.set(this.app.canvas.width - 20, this.scene.LINE_Y - 50);
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;

        this.addStatsBar();
        
    }

    addStatsBar() {
        let padding = 5;
        let x = this.app.canvas.width - padding - 190;
        let y = this.scene.LINE_Y - 300;

        let rec = new Graphics()
            .roundRect(x, y, 190, 100, 10)
            .fill('ffffff')
            //.stroke({ width: 1, color: "ffffff" });
        
        this.scene.addChild(rec);
        
        this.statsBar = new Text({
            text: this.showStats(),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: { color: 0x000000, alpha: 1 },
                //stroke: { color: 0x000000, width: 1 },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        this.statsBar.x = x + padding;
        this.statsBar.y = y + padding;
        
        this.scene.addChild(this.statsBar);
    }

    showStats() {
        let statsText = `             MONSTER \n\n`;
        statsText += `HP: ${this.stats.currentHP}/${this.stats.hp} \n`
        statsText += `Def: ${this.stats.def} \n`;
        statsText += `Agi: ${this.stats.agi} \n`;

        return statsText;
    }

    updateStats() {
        this.statsBar.text = this.showStats();
    }

    async hitBullet() {
        // this.sprite.textures = this.sheet.animations.idle;
        // this.sprite.gotoAndPlay(0);
        //this.state.beaten = true;
        //this.sprite.position.x += 1;
        this.stats.currentHP -= this.scene.warrior.stats.str - this.stats.def;
        this.statsBar.text = this.showStats();
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
        if (this.sprite.position.x <= this.scene.warrior.position() + 20) {
            //this.sprite.position.x = this.app.canvas.width - 150;
            this.scene.warriorLose();
        } else {
            this.move()
        }
    }

    move() {
        this.sprite.position.x -= 1 * this.stats.agi / 10;
        if (this.scene.box.monsterCard) {
            this.scene.box.monsterCard.position.x = this.sprite.position.x;
            this.scene.box.monsterTxtCard.position.x = this.sprite.position.x;
        }
    }
}
