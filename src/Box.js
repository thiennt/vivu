import { Assets, Container, AnimatedSprite, Graphics, Text, SplitText, Sprite } from 'pixi.js';
import { getRandomItemByRate, getRandomItems } from './util.js';

export class Box {
    constructor(app, scene) {
        this.app = app;
        this.view = new Container();
        this.scene = scene;
        
        this.effects = {
            "str": [
                { value: 1, rate: 0.1 },
                { value: 2, rate: 0.1 },
                { value: 3, rate: 0.1 },
                { value: 4, rate: 0.1 },
                { value: 5, rate: 0.1 },
                { value: -1, rate: 0.1 },
                { value: -2, rate: 0.1 },
                { value: -3, rate: 0.1 },
                { value: -4, rate: 0.1 },
                { value: -5, rate: 0.1 }
            ],
            "crit" : [
                { value: 10, rate: 0.1 },
                { value: 20, rate: 0.1 },
                { value: 30, rate: 0.1 },
                { value: 40, rate: 0.1 },
                { value: 50, rate: 0.1 },
                { value: -10, rate: 0.1 },
                { value: -20, rate: 0.1 },
                { value: -30, rate: 0.1 },
                { value: -40, rate: 0.1 },
                { value: -50, rate: 0.1 }
            ],
            "def": [
                { value: 1, rate: 0.1 },
                { value: 2, rate: 0.1 },
                { value: 3, rate: 0.1 },
                { value: 4, rate: 0.1 },
                { value: 5, rate: 0.1 },
                { value: -1, rate: 0.1 },
                { value: -2, rate: 0.1 },
                { value: -3, rate: 0.1 },
                { value: -4, rate: 0.1 },
                { value: -5, rate: 0.1 }
            ],
            "hp": [
                { value: 1, rate: 0.1 },
                { value: 2, rate: 0.1 },
                { value: 3, rate: 0.1 },
                { value: 4, rate: 0.1 },
                { value: 5, rate: 0.1 },
                { value: -1, rate: 0.1 },
                { value: -2, rate: 0.1 },
                { value: -3, rate: 0.1 },
                { value: -4, rate: 0.1 },
                { value: -5, rate: 0.1 }
            ],
            "agi": [
                { value: 1, rate: 0.1 },
                { value: 2, rate: 0.1 },
                { value: 3, rate: 0.1 },
                { value: 4, rate: 0.1 },
                { value: 5, rate: 0.1 },
                { value: -1, rate: 0.1 },
                { value: -2, rate: 0.1 },
                { value: -3, rate: 0.1 },
                { value: -4, rate: 0.1 },
                { value: -5, rate: 0.1 }
            ]
        }
    }

    init() {
        this.addBoxes();
    }

    async addBoxes() {
        this.boxSheet = await Assets.load('effect');

        this.CARD_Y = this.scene.LINE_Y + 150;
        this.CARD_Y_1 = this.scene.LINE_Y + 70;
        this.CARD_Y_2 = this.CARD_Y_1 + 90;
        this.CARD_TITTLE_Y = this.scene.LINE_Y + 50;
        this.CARD_TEXT_Y = this.scene.LINE_Y + 200;
        this.CARD_EFFECT_Y = this.scene.LINE_Y + 70;

        this.addCardTitle();
        
        this.addHeroCard();
        this.addMonsterCard();
    }

    addCardTitle() {
        let title = new Text({
            text: "Choose Effect",
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: { color: 0xFFFFFF, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        title.anchor.set(0.5, 0.5);
        title.x = this.app.canvas.width / 2;
        title.y = this.scene.LINE_Y + 25;
        this.view.addChild(title);
    }

    // cardType: 0: Hero, 1: Monster
    async addCard(randomEffect, randomEffectValue, cardType=0) {
        let boxSpace = this.app.canvas.width / 2;
        let cardPosX = (boxSpace)/2;
        if (cardType == 1) cardPosX += boxSpace;
        
        // Card
        const texture = await Assets.load('images/card.png');
        let card = new Sprite({
            texture: texture,
            anchor: 0.5,
            //scale: { x: 1, y: 1 },
            width: 150,
            height: 180
        });
        
        card.position.set(cardPosX, this.CARD_Y);

        card.interactive = true;
        card.cursor = "pointer";

        card.on('pointerover',function (event) {
            card.width = 155;
            card.height = 185;
        });

        card.on('pointerout',function (event) {
            card.width = 150;
            card.height = 180;
        });

        this.view.addChild(card);

        let titleText = "HERO";
        let titleColor = "0xFFFFFF"
        if (cardType == 1) {
            titleText = "MONSTER";
            titleColor = "150404";
        }

        // Card title
        let title = new Text({
            text: titleText,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: { color: titleColor, alpha: 1 },
                stroke: { color: titleColor, width: 1 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        title.anchor.set(0.5, 0.5);
        title.x = cardPosX;
        title.y = this.CARD_Y - 80;
        this.view.addChild(title);

        // Card effect
        let animations = this.boxSheet.animations;
        let sprite = new AnimatedSprite(animations[randomEffect]);
        sprite.anchor = 0.5;
        sprite.scale = 0.7;

        sprite.position.set(cardPosX, this.CARD_Y - 30);
        sprite.loop = false;
        this.view.addChild(sprite);

        // Card text
        let cardColor = 0xFA1112;
        let textLabel =  `${randomEffectValue.value} ${randomEffect.toUpperCase()}`;

        if (randomEffectValue.value > 0) {
            cardColor = 0x6DEF15;
            textLabel = `+${randomEffectValue.value} ${randomEffect.toUpperCase()}`;
        }

        let txtCard = new Text({
            text: textLabel,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: cardColor, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        txtCard.anchor.set(0.5, 0.5);
        txtCard.x = cardPosX;
        txtCard.y = this.CARD_TEXT_Y;
        this.view.addChild(txtCard);

        card.on("mousedown", this.chooseCard.bind(this, randomEffect, randomEffectValue, cardType));
    }

     addHeroCard() {
        let randomEffect = getRandomItems(["str", "crit", "agi"], 1)[0];
        let randomEffectValue = this.getRandomEffectValue(randomEffect);

        this.addCard(randomEffect, randomEffectValue, 0);
    }

    addMonsterCard() {
        let randomEffect = getRandomItems(["hp", "def", "agi"], 1)[0];
        let randomEffectValue = this.getRandomEffectValue(randomEffect);

        this.addCard(randomEffect, randomEffectValue, 1);
    }

    getRandomEffectValue(randomEffect) {
        return getRandomItemByRate(this.effects[randomEffect]);
    }

    chooseCard(effect, effectValue, cardType) {
        if (cardType == 0) {
            //console.log("hero", this.scene.warrior.stats[effect], effect, effectValue.value);
            let hero = this.scene.warrior;
            hero.stats[effect] += effectValue.value;
            hero.updateStats();
        } else {
            //console.log("monster", this.scene.mew.stats[effect], effect, effectValue.value);
            let monster = this.scene.mew;
            monster.stats[effect] += effectValue.value;
            monster.updateStats();
        }

        this.scene.showSelectedEffect(effect, effectValue, cardType);
    }

    openBox(effect, effectValue) {
        // box.textures = this.boxSheet.animations.open;
        // box.gotoAndPlay(0);
        // box.animationSpeed = 0.1;

        console.log(effect, effectValue);

        this.scene.addBullets();
    }
}

