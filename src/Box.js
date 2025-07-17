import { Assets, Container, AnimatedSprite, Graphics, Text, SplitText } from 'pixi.js';
import { getRandomItemByRate, getRandomItems } from './util.js';

export class Box {
    constructor(app, scene) {
        this.app = app;
        this.view = new Container();
        this.scene = scene;
        
        this.addBoxes();

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

    async addBoxes() {
        let boxSize = 2;
        this.boxSheet = await Assets.load('effect');
        let randomEffects = this.getRandomEffects(boxSize);
        
        let boxSpace = this.app.canvas.width / boxSize;
        let animations = this.boxSheet.animations;

        this.addHeroCArd();
        this.addMonsterCArd();
    }

    addHeroCArd() {
        let randomEffect = getRandomItems(["str", "crit", "agi"], 1);
        let randomEffectValue = this.getRandomEffectValue(randomEffect);

        let boxSpace = this.app.canvas.width / 2;
        let animations = this.boxSheet.animations;

        let card = new Graphics();
        let strokeColor = 0xC8957F;
        let cardPosX = (boxSpace - 150)/2 + (0 * boxSpace);
        card.rect(cardPosX, this.scene.LINE_Y + 50, 150, 90);
        card.fill(0x3E0D04);
        card.stroke({ width: 2, color: strokeColor });

        card.rect(cardPosX, this.scene.LINE_Y + 140, 150, 90);
        card.fill(0x1F5509);
        card.stroke({ width: 2, color: strokeColor });

        card.interactive = true;
        card.cursor = "pointer";
        card.buttonMode = true;

        card.on("click", this.chooseHeroCard.bind(this, randomEffect, randomEffectValue));
        this.view.addChild(card);


        //let sprite = new AnimatedSprite(boxes[i]);
        let sprite = new AnimatedSprite(animations[randomEffect]);
        //sprite.anchor = 0.5;
        sprite.scale = 0.7;

        let x = (boxSpace - sprite.width)/2 + (0 * boxSpace);
        sprite.position.set(x, this.scene.LINE_Y + 50);
        
        sprite.loop = false;
        
        this.view.addChild(sprite);        
    }

    addMonsterCArd() {
        let randomEffect = getRandomItems(["hp", "def", "agi"], 1)[0];
        let randomEffectValue = this.getRandomEffectValue(randomEffect);
        
        let boxSpace = this.app.canvas.width / 2;
        let animations = this.boxSheet.animations;

        let card = new Graphics();
        let strokeColor = 0xC8957F;
        let cardPosX = (boxSpace - 150)/2 + (1 * boxSpace);
        card.rect(cardPosX, this.scene.LINE_Y + 50, 150, 90);
        card.fill(0x3E0D04);
        card.stroke({ width: 2, color: strokeColor });

        let cardColor = 0xFA1112;
        let textLabel =  `${randomEffectValue.value} ${randomEffect.toUpperCase()}`;

        if (randomEffectValue.value > 0) {
            cardColor = 0x1F5509;
            textLabel = `+${randomEffectValue.value} ${randomEffect.toUpperCase()}`;
        }

        let card2 = new Graphics();
        card2.rect(cardPosX, this.scene.LINE_Y + 140, 150, 90);
        card2.fill(cardColor);
        card2.stroke({ width: 2, color: strokeColor });

        card.interactive = true;
        card.cursor = "pointer";
        card.buttonMode = true;

        card.on("click", this.chooseHeroCard.bind(this, randomEffect, randomEffectValue));

        let txtCard = new Text({
            text: textLabel,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: 0xFFFFFF, alpha: 1 },
                stroke: { color: 0x4a1850, width: 2 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        txtCard.anchor.set(0.5, 0.5);
        txtCard.x = cardPosX + 150/2;
        txtCard.y = this.scene.LINE_Y + 180;
        card2.addChild(txtCard);
        
        let sprite = new AnimatedSprite(animations[randomEffect]);
        //sprite.anchor = 0.5;
        sprite.scale = 0.7;

        let x = (boxSpace - sprite.width)/2 + (1 * boxSpace);
        sprite.position.set(x, this.scene.LINE_Y + 50);
        
        sprite.loop = false;
        
        card.addChild(sprite);
        this.view.addChild(card);
        this.view.addChild(card2);
    }

    getRandomEffectValue(randomEffect) {
        return getRandomItemByRate(this.effects[randomEffect]);
    }

    getRandomEffects(count) {
        return ["str", "crit", "def", "hp", "agi"].sort(() => 0.5 - Math.random()).slice(0, count);
    }

    chooseHeroCard(effect, effectValue) {

    }

    openBox(effect, effectValue) {
        // box.textures = this.boxSheet.animations.open;
        // box.gotoAndPlay(0);
        // box.animationSpeed = 0.1;

        console.log(effect, effectValue);

        this.scene.addBullets();
    }
}

