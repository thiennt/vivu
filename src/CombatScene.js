import { Graphics, Container, Text, Sprite, Assets } from 'pixi.js';
import { Warrior } from './Warrior';
import { Mew } from './Mew';
import { Box } from './Box';
import { testForAABB } from './util';

export class CombatScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        
        this.bulletTotal = 0;
        this.LINE_Y = 400;

        this.init();
    }

    async init() {
        this.addBackground();
        //this.addLine();
        //this.addInventory();
        this.addWarrior();
        this.addMew();
        this.addBoxes();
    }

    addChild(child) {
        this.view.addChild(child);
    }

    removeChild(child) {
        this.view.removeChild(child);
    }

    async addBackground() {
        const texture = await Assets.load('images/dungeon_1.png');
        this.background = new Sprite({
            texture: texture,
            anchor: 0.5,
            //scale: { x: 1, y: 1 },
            //width: 400,
            //height: 400
        });

        // Center background sprite anchor.
        this.background.position.set(this.app.canvas.width / 2, 200);
        this.background.zIndex = -1; // Ensure background is behind other elements

        this.LINE_Y = this.background.height;

        this.addChild(this.background);
    }


    addLine() {
        const line = new Graphics()
            .moveTo(0, 200)
            .lineTo(this.app.canvas.width, this.LINE_Y)
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
        inventory.y = 250

        inventory.interactive = true;
        inventory.cursor = "pointer";
        inventory.buttonMode = true;
        inventory.on("click", this.addBullets.bind(this));

        this.view.addChild(inventory);
    }

    addBoxes() {
        this.box = new Box(this.app, this);
        this.view.addChild(this.box.view);
    }

    resetBoxes() {
        this.view.removeChild(this.box);
        this.addBoxes();
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
