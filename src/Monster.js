import { AnimatedSprite, Assets, Text, Graphics, Sprite, Texture } from 'pixi.js';

export class Monster {
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
            "maxHp": 15,
            "atk": 6,
            "def": 4,
            "crit": 3,
            "agi": 2
        };
    }

    async init() {
        //this.sheet = await Assets.load('mew');
        //this.sprite = new AnimatedSprite(this.sheet.animations.run);
        this.sheet = this.scene.monsterSheet;
        this.sprite = this.scene.monsterSprite;
        this.sprite.anchor = 0.5;
        this.sprite.width = 120;
        this.sprite.height = 140;
        this.sprite.position.set(this.app.canvas.width /2 + 50, this.scene.LINE_Y - 50);
        this.sprite.play();
        this.sprite.animationSpeed = 0.1;

        this.addStatsBar();
        this.addHpBar();
    }

    addStatsBar() {
        let padding = 5;
        let x = this.app.canvas.width - padding - 190;
        let y = this.scene.LINE_Y - 400;

        let rec = new Graphics()
            .roundRect(x, y, 190, 220, 10)
            .fill('ffffff')
            //.stroke({ width: 1, color: "ffffff" });
        
        this.scene.addChild(rec);
        
        let iconX = x + 10 + padding;

        let hpIcon = this.addIcon("hp", iconX, y + 52);
        this.scene.addChild(hpIcon);
        
        let atkIcon = this.addIcon("atk", iconX, y + 87);
        this.scene.addChild(atkIcon);

        let defIcon = this.addIcon("def", iconX, y + 122);
        this.scene.addChild(defIcon);

        let critIcon = this.addIcon("crit", iconX, y + 157);
        this.scene.addChild(critIcon);

        let agiIcon = this.addIcon("agi", iconX, y + 194);
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

    addHpBar() {
        let x = this.sprite.position.x - 30;
        let y = this.sprite.position.y - 70;
        
        this.maxHpBar = new Graphics()
            .rect(x, y, 70, 5)
            .fill({ color: "000000" });
        this.scene.addChild(this.maxHpBar);
        
        this.hpBar = new Graphics()
            .rect(x, y, 70, 5)
            .fill({ color: 0x666666 });
        this.scene.addChild(this.hpBar);
    }    

     showStats() {
        let statsText = `MONSTER \n\n`;
        statsText += `HP: ${this.stats.hp}/${this.stats.maxHp} \n\n`;
        statsText += `ATK: ${this.stats.atk} \n\n`;
        statsText += `DEF: ${this.stats.def} \n\n`;
        statsText += `CRIT: ${this.stats.crit}% \n\n`;
        statsText += `AGI: ${this.stats.agi} \n`;

        return statsText;
    }

    updateStats() {
        this.statsBar.text = this.showStats();
    }

    hitBullet(bullet) {
        // this.sprite.textures = this.sheet.animations.idle;
        // this.sprite.gotoAndPlay(0);
        //this.state.beaten = true;
        //this.sprite.position.x += 1;
        let currentHp = parseFloat(this.stats.hp);
        currentHp -= bullet.atk - this.stats.def;
        //this.stats.hp -= (this.scene.warrior.stats.str - this.stats.def).toFixed(2);
        this.stats.hp = currentHp.toFixed(2);
        this.statsBar.text = this.showStats();
        if (this.stats.hp <= 0) {
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
        if (this.sprite.position.x <= this.scene.warrior.sprite.position.x + 20) {
            //this.sprite.position.x = this.app.canvas.width - 150;
            this.scene.warriorLose();
        } else {
            this.move()
        }
    }

    move() {
        this.sprite.position.x -= 1 * this.stats.agi / 10;
        let currentX = this.sprite.position.x;
        let currentY = this.sprite.position.y - 70;

        if (this.hpBar) {
            let healthPercentage = this.stats.hp / this.stats.maxHp;

            this.hpBar.clear()
                .rect(currentX - 30, currentY, 70 * healthPercentage, 5)
                .fill({ color: 0x666666 });

            this.maxHpBar.clear()
                .rect(currentX - 30, currentY, 70, 5)
                .fill({ color: 0x000000 });
        }

        if (this.scene.box.monsterCard) {
            this.scene.box.monsterCard.position.x = currentX;
            this.scene.box.monsterTxtCard.position.x = currentX;
        }
    }
}

