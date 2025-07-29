import {
  Assets,
  Container,
  AnimatedSprite,
  Graphics,
  Text,
  SplitText,
  Sprite,
} from "pixi.js";
import { getRandomItemByRate, getRandomItems } from "./util.js";

export class Box {
  constructor(app, scene) {
    this.app = app;
    this.view = new Container();
    this.scene = scene;

    this.effects = {
      atk: [
        { value: 1, rate: 0.2 },
        { value: 5, rate: 0.2 },
        { value: 10, rate: 0.05 },
        { value: 15, rate: 0.05 },
        { value: -5, rate: 0.25 },
        { value: -10, rate: 0.15 },
        { value: -15, rate: 0.1 },
      ],
      crit: [
        { value: 5, rate: 0.2 },
        { value: 10, rate: 0.1 },
        { value: 15, rate: 0.1 },
        { value: 20, rate: 0.1 },
        { value: -5, rate: 0.2 },
        { value: -10, rate: 0.1 },
        { value: -15, rate: 0.1 },
        { value: -20, rate: 0.1 },
      ],
      def: [
        { value: 1, rate: 0.3 },
        { value: 5, rate: 0.25 },
        { value: 10, rate: 0.2 },
        { value: 15, rate: 0.15 },
        { value: -1, rate: 0.05 },
        { value: -5, rate: 0.05 },
      ],
      hp: [
        { value: 1, rate: 0.3 },
        { value: 5, rate: 0.25 },
        { value: 10, rate: 0.2 },
        { value: 15, rate: 0.15 },
        { value: -1, rate: 0.05 },
        { value: -5, rate: 0.05 },
      ],
      agi: [
        { value: 5, rate: 0.2 },
        { value: 10, rate: 0.1 },
        { value: 15, rate: 0.1 },
        { value: 20, rate: 0.1 },
        { value: -5, rate: 0.2 },
        { value: -10, rate: 0.1 },
        { value: -15, rate: 0.1 },
        { value: -20, rate: 0.1 },
      ],
    };

    this.isLoaded = false;
  }

  init() {
    this.addBoxes();
  }

  addBoxes() {
    this.boxSheet = this.scene.skillsSheet;

    //if (!this.scene.warrior.sprite || !this.scene.mew.sprite ) return;

    this.addHeroCard();
    this.addMonsterCard();
    this.isLoaded = true;
  }

  // cardType: 0: Hero, 1: Monster
  async addCard(randomEffect, randomEffectValue, cardType = 0) {
    let pos =
      cardType == 0
        ? this.scene.warrior.sprite.position
        : this.scene.mew.sprite.position;
    let cardPosX = pos.x;
    let cardPosY = pos.y - 110;

    // Card effect
    let animations = this.boxSheet.animations;
    let sprite = new AnimatedSprite(animations[randomEffect]);

    //let sprite = this.scene.skillsSprites[randomEffect];
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

    sprite.on(
      "mousedown",
      this.chooseCard.bind(this, randomEffect, randomEffectValue, cardType),
    );
    this.view.addChild(sprite);

    // Card text
    let cardColor = "000000";
    let textLabel = `${randomEffectValue.value}% ${randomEffect.toUpperCase()}`;

    if (randomEffectValue.value > 0) {
      cardColor = "ffffff";
      textLabel = `+${randomEffectValue.value}% ${randomEffect.toUpperCase()}`;
    }

    let txtCard = new Text({
      text: textLabel,
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: { color: "000000", alpha: 1 },
        //stroke: { color: "000000", width: 1 },
        //wordWrap: true,
        //wordWrapWidth: 50,
        align: "center",
      },
    });
    txtCard.anchor.set(0.5, 0.5);
    txtCard.x = cardPosX;
    txtCard.y = cardPosY + 30;
    this.view.addChild(txtCard);

    return [sprite, txtCard];
  }

  async addHeroCard() {
    let randomEffect = getRandomItems(["atk", "crit", "agi"], 1)[0];
    let randomEffectValue = this.getRandomEffectValue(randomEffect);

    [this.heroCard, this.heroTxtCard] = await this.addCard(
      randomEffect,
      randomEffectValue,
      0,
    );
  }

  async addMonsterCard() {
    let randomEffect = getRandomItems(["hp", "def", "agi"], 1)[0];
    let randomEffectValue = this.getRandomEffectValue(randomEffect);

    [this.monsterCard, this.monsterTxtCard] = await this.addCard(
      randomEffect,
      randomEffectValue,
      1,
    );
  }

  getRandomEffectValue(randomEffect) {
    return getRandomItemByRate(this.effects[randomEffect]);
  }

  chooseCard(effect, effectValue, cardType) {
    if (cardType == 0) {
      let hero = this.scene.warrior;
      let stat = parseFloat(hero.stats[effect]);
      let num = stat + (stat * effectValue.value) / 100;
      num = effect == "crit" ? stat + effectValue.value : num;
      num = num < 0 ? 0 : num;
      hero.stats[effect] = num.toFixed(2);
      hero.updateStats();
    } else {
      let monster = this.scene.mew;
      let stat = parseFloat(monster.stats[effect]);
      let num = stat + (stat * effectValue.value) / 100;
      monster.stats[effect] = num.toFixed(2);
      monster.updateStats();
    }

    this.scene.showSelectedEffect(effect, effectValue, cardType);
  }
}
