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

        this.isLoaded = false;
    }

    init() {
        this.addBoxes();
    }

    async addBoxes() {
        this.boxSheet = await Assets.load('skills');

        if (!this.scene.warrior.sprite || !this.scene.mew.sprite ) return;
        
        this.addHeroCard();
        this.addMonsterCard();
        this.isLoaded = true;
    }

    // cardType: 0: Hero, 1: Monster
    async addCard(randomEffect, randomEffectValue, cardType=0) {
        let pos = cardType == 0 ? this.scene.warrior.sprite.position : this.scene.mew.sprite.position;
        let cardPosX = pos.x;
        let cardPosY = pos.y - 110;
        
        // Card effect
        let animations = this.boxSheet.animations;
        let sprite = new AnimatedSprite(animations[randomEffect]);
        sprite.anchor = 0.5;
        //sprite.scale = 0.7;
        sprite.width = 36;
        sprite.height = 36;

        sprite.position.set(cardPosX, cardPosY);
        sprite.loop = false;

        sprite.interactive = true;
        sprite.cursor = "pointer";

        // sprite.on('pointerover',function (event) {
        //     sprite.width = 45;
        //     sprite.height = 65;
        // });

        // sprite.on('pointerout',function (event) {
        //     sprite.width = 40;
        //     sprite.height = 40;
        // });

        sprite.on("mousedown", this.chooseCard.bind(this, randomEffect, randomEffectValue, cardType));
        this.view.addChild(sprite);

        // Card text
        let cardColor = "000000";
        let textLabel =  `${randomEffectValue.value} ${randomEffect.toUpperCase()}`;

        if (randomEffectValue.value > 0) {
            cardColor = "ffffff";
            textLabel = `+${randomEffectValue.value} ${randomEffect.toUpperCase()}`;
        }

        let txtCard = new Text({
            text: textLabel,
            style: {
                fontFamily: 'Arial',
                fontSize: 11,
                fill: { color: "000000", alpha: 1 },
                //stroke: { color: "000000", width: 1 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        txtCard.anchor.set(0.5, 0.5);
        txtCard.x = cardPosX;
        txtCard.y = cardPosY + 30;
        this.view.addChild(txtCard);

        return [sprite, txtCard];
    }

    async addHeroCard() {
        let randomEffect = getRandomItems(["str", "crit", "agi"], 1)[0];
        let randomEffectValue = this.getRandomEffectValue(randomEffect);

        [this.heroCard, this.heroTxtCard] = await this.addCard(randomEffect, randomEffectValue, 0);
    }

    async addMonsterCard() {
        let randomEffect = getRandomItems(["hp", "def", "agi"], 1)[0];
        let randomEffectValue = this.getRandomEffectValue(randomEffect);

        [this.monsterCard, this.monsterTxtCard] = await this.addCard(randomEffect, randomEffectValue, 1);
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

