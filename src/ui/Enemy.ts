import { Container, Assets, AnimatedSprite, Sprite } from "pixi.js";
import { getRandomItemByRate, AnimationSet } from "../utils/common";
import { Stats } from "../utils/common";

export class Enemy extends Container {
  public character: AnimatedSprite;
  public animations: AnimationSet = {
    idle: [],
    run: [],
    fight: [],
    crit: [],
  };
  public stats: Stats = {
    hp: 15,
    maxHp: 15,
    atk: 6,
    def: 4,
    crit: 20,
    agi: 2,
  };
  public supportStats: Stats = {
    hp: 0,
    maxHp: 0,
    atk: 0,
    def: 0,
    crit: 0,
    agi: 0,
  };

  public baseHitRate = 65;
  public baseSPA = 0.3; // seconds per action

  constructor() {
    super();

    this.initAnimations();

    this.character = new AnimatedSprite(this.animations.idle);
    this.character.anchor = 0.5;
    this.character.scale.set(1);
    // this.sprite.width = 40;
    // this.sprite.height = 80;
    this.character.animationSpeed = 0.05;
    this.character.play();
    //this.character.position.set(this.app.canvas.width / 2 - 50, this.scene.LINE_Y - 42);

    this.addChild(this.character);
  }

  public initAnimations() {
    const textures = Assets.get("monster").textures;

    this.animations.idle = [textures.demon_1, textures.demon_2];
    this.animations.run = [
      textures.demon_3,
      textures.demon_4,
      textures.demon_5,
    ];
    this.animations.fight = [
      textures.demon_6,
      textures.demon_7,
      textures.demon_13,
    ];
    this.animations.crit = [
      textures.demon_6,
      textures.demon_7,
      textures.demon_13,
      textures.demon_9,
      textures.demon_10,
      textures.demon_12,
    ];
  }

  public fight() {
    let critRate = [
      { value: false, rate: 100 - this.stats.crit },
      { value: true, rate: this.stats.crit },
    ];
    let isCrit = getRandomItemByRate(critRate).value;
    let damage = isCrit ? this.stats.atk * 2 : this.stats.atk;
    let hitRate = this.baseHitRate + this.stats.agi;

    return { isCrit: isCrit, damage: damage, hitRate: hitRate };
  }

  public idle() {
    this.character.textures = this.animations.idle;
    this.character.animationSpeed = 0.1;
    this.character.gotoAndPlay(0);
  }

  public takeDamage(damage: number, hitRate: number) {
    this.stats.hp -= damage - this.stats.def;
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
    }
  }

  public applyStats(statsName: string, statsValue: number) {
    this.stats[statsName] += statsValue;
    this.supportStats[statsName] += statsValue;
  }
}
