import { Graphics, Container, Text, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { Warrior } from './Warrior';
import { Mew } from './Mew';
import { Box } from './Box';
import { testForAABB, delay } from './util';

export class CombatScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        this.view.isRenderGroup = true;
        
        this.bulletTotal = 0;
        this.LINE_Y = 400;

        this.gameState = 0;
    }

    init() {
        this.addMenu();
        //this.addBackground();
        //this.addLine();
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

    async loadAssets() {
        this.skillsSheet = await Assets.load('skills');
        //let skillsAnimations = this.skillsSheet.animations;
        
        // this.skillsSprites = ["str", "crit", "agi", "hp", "def"].reduce((hash, skill) => {
        //     hash[skill] = new AnimatedSprite(skillsAnimations[skill]);
        //     return hash;
        // }, {});
        
        this.heroSheet = await Assets.load('stickman');
        this.heroSprite = new AnimatedSprite(this.heroSheet.animations.idle);
        
        this.monsterSheet = await Assets.load('mew');
        this.monsterSprite = new AnimatedSprite(this.monsterSheet.animations.run);

    }

    async addBackground() {
        const texture = await Assets.load('images/dungeon_2.png');
        this.background = new Sprite({
            texture: texture,
            anchor: 0.5,
            //scale: { x: 1, y: 1 },
            //width: 400,
            //height: 400
        });

        // Center background sprite anchor.
        let y = this.app.canvas.height / 3;
        this.background.position.set(this.app.canvas.width / 2, y);
        this.background.zIndex = -1; // Ensure background is behind other elements

        this.LINE_Y = y + this.background.height / 2;

        this.addChild(this.background);
    }

    addMenu() {
        this.LINE_Y = this.app.canvas.height /2;
        this.menuBar = new Graphics()
            .rect(0, this.app.canvas.height /2, this.app.canvas.width, 100)
            .fill('000000')
            .stroke({ width: 1, color: "333333" });
        
        this.addChild(this.menuBar);
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

    addBoxes() {
        this.box = new Box(this.app, this);
        this.box.init();
        this.view.addChild(this.box.view);
    }

    removeCards() {
        this.view.removeChild(this.box.view);
    }

    showSelectedEffect(effect, effectValue, cardType) {
        this.removeCards();

         // Card text
        let cardColor = "000000";
        let textLabel =  `${effectValue.value}% ${effect.toUpperCase()}`;

        if (effectValue.value > 0) {
            cardColor = "ffffff";
            textLabel = `+${effectValue.value}% ${effect.toUpperCase()}`;
        }

        let txtCard = new Text({
            text: cardType == 0 ? "HERO: " + textLabel : "MONSTER: " + textLabel,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: "000000", alpha: 1 },
                stroke: { color: "ffffff", width: 2 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        txtCard.anchor.set(0.5, 0.5);
        txtCard.x = this.app.canvas.width / 2;;
        txtCard.y = this.LINE_Y - 150;

        this.view.addChild(txtCard);

        this.reloadCardsAfterEffect(txtCard);

    }

    async reloadCardsAfterEffect(selectedCard) {
        await delay(2000);

        this.view.removeChild(selectedCard);
        this.addBoxes();
    }

    resetBoxes() {
        this.view.removeChild(this.box.view);
        this.addBoxes();
    }

    async addWarrior() {
        this.warrior = new Warrior(this.app, this);
        this.warrior.init();
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
        // if (!this.box.isLoaded) {
        //     this.box.addBoxes();
        //     this.box.isLoaded = true;
        // }

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
        this.gameState = 1;

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
        this.gameState = 1;
        
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
