import { Graphics, Container, Text } from 'pixi.js';
import { Warrior } from './Warrior';
import { Mew } from './Mew';
import { testForAABB } from './util';

export class CombatScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        
        this.bulletTotal = 0;

        this.addLine();
        this.addInventory();
        this.addWarrior();
        this.addMew();
    }

    addChild(child) {
        this.view.addChild(child);
    }

    removeChild(child) {
        this.view.removeChild(child);
    }

    addLine() {
        const line = new Graphics()
            .moveTo(0, 135)
            .lineTo(this.app.canvas.width, 135)
            .stroke({
                color: 0x55ffaa
            });

        this.view.addChild(line);
    }

    addInventory() {
        const inventory = new Text({
            text: 'Click to add bullets ' + this.bulletTotal,
            style: {
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: { color: 0x4a1850, alpha: 1 },
                stroke: { color: 0x4a1850, width: 5 },
                dropShadow: {
                color: 0x000000,
                angle: Math.PI / 6,
                blur: 4,
                distance: 6,
                },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        inventory.x = Math.round((this.view.width - inventory.width) / 2);
        inventory.y = 150

        inventory.interactive = true;
        inventory.cursor = "pointer";
        inventory.buttonMode = true;
        inventory.on("click", this.addBullets.bind(this));

        this.view.addChild(inventory);
    }

    async addWarrior() {
        this.warrior = new Warrior(this.app, this);
        await this.warrior.init();
        this.view.addChild(this.warrior.sprite);
    }

    async addMew() {
        this.mew = new Mew(this.app, this);
        await this.mew.init();
        this.view.addChild(this.mew.sprite);
        this.view.addChild(this.mew.hpBar);
    }

    addBullets() {
        this.bulletTotal += 1;
    }

    update() {
        this.warrior.update();
        this.mew.update();

        for (let bullet of this.warrior.bullets) {
            if (testForAABB(bullet, this.mew.sprite)) {
                this.mew.hitBullet();
                this.warrior.bullets.shift();
                this.removeChild(bullet);
            } else {
                //this.mew.continueRunning();
            }
        }
    }

    warriorLose() {
        this.mew.sprite.textures = this.mew.sheet.animations.idle;
        this.mew.sprite.gotoAndPlay(0);
        this.mew.state.idle = true;

        const loseText = new Text({
            text: 'You Lose!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x000000, width: 2 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 6,
                },
            }
        });
        loseText.x = Math.round((this.view.width - loseText.width) / 2);
        loseText.y = Math.round((this.view.height - loseText.height) / 2);

        this.view.addChild(loseText);
    }

    warriorWin() {
        this.mew.sprite.textures = this.mew.sheet.animations.idle;
        this.mew.sprite.gotoAndPlay(0);
        this.mew.state.idle = true;

        const winText = new Text({
            text: 'You Win!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: { color: 0x85EF14, alpha: 1 },
                stroke: { color: 0x000000, width: 2 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 6,
                },
            }
        });
        winText.x = Math.round((this.view.width - winText.width) / 2);
        winText.y = Math.round((this.view.height - winText.height) / 2);

        this.view.addChild(winText);
    }
}
