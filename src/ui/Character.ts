import {
  Container,
  Assets,
  AnimatedSprite,
  Sprite,
  Graphics,
  Text,
  FillGradient,
} from "pixi.js";
import { getRandomItemByRate, AnimationSet } from "../utils/common";
import {
  fireAnimation,
  slashAnimation,
  thunderAnimation,
  windAnimation,
} from "./SkillsAnimation";

import { Stats } from "../utils/common";
import gsap from "gsap";
import { Monster } from "./Monster";
import { Hero } from "./Hero";

export class Character extends Container {
  public maxHpBar: Graphics;
  public hpBar: Graphics;
  protected frame: Graphics;
  public avatar: Sprite;
  public username: Text;

  public stats: Stats = {
    hp: 16,
    maxHp: 16,
    atk: 5,
    def: 5,
    crit: 20,
    agi: 3,
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
  public baseSPA = 1.5; // seconds per action

  constructor(
    options: { rarity?: string; name: string } = {
      rarity: "novice",
      name: "plus",
    },
  ) {
    super();

    this.initAvatar(options.name);
  }

  public initFrame(rarity: string = "novice") {
    this.frame = new Graphics();
    this.frame
      .roundRect(-55, -60, 110, 140, 2)
      .stroke({ width: 1, color: 0x000000 })
      .fill(0x000000);
    this.addChild(this.frame);
  }

  public initAvatar(name: string) {
    this.avatar = new Sprite(Assets.get(name));
    this.avatar.anchor = 0.5;
    if (this.avatar.width > 100 || this.avatar.height > 100) {
      this.avatar.scale.set(0.5);
    }
    this.addChild(this.avatar);
  }

  public initHpBar() {
    this.maxHpBar = new Graphics();
    this.maxHpBar
      .roundRect(-50, 50, 100, 10, 1)
      .stroke({ width: 1, color: 0x000000 })
      .fill(0x000000);
    this.addChild(this.maxHpBar);

    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      type: "linear",
      colorStops: [
        { offset: 0, color: "#ff4c4c" },
        { offset: 0.7, color: "#ff4c4c" },
        { offset: 1, color: "#ffaaaa" },
      ],
    });

    //background: linear-gradient(90deg, #00bfff 70%, #aaffff 100%); => xp bar

    this.hpBar = new Graphics();
    this.hpBar.roundRect(-50, 50, 100, 10, 1).fill(gradient);
    this.addChild(this.hpBar);
  }

  public updateHpBar() {
    const healthPercentage = this.stats.hp / this.stats.maxHp;

    const gradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      type: "linear",
      colorStops: [
        { offset: 0, color: "#ff4c4c" },
        { offset: 0.7, color: "#ff4c4c" },
        { offset: 1, color: "#ffaaaa" },
      ],
    });

    this.hpBar
      .clear()
      .roundRect(-50, 50, 100 * healthPercentage, 10, 1)
      .fill(gradient);
  }

  public takeDamage(damage: number) {
    this.stats.hp -= damage;
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
    }

    this.updateHpBar();
  }

  public isDie(): boolean {
    return this.stats.hp <= 0;
  }

  public attack(
    target: Hero | Monster,
    animationFn: ({
      x,
      y,
      direction,
      scale,
    }: {
      x: number;
      y: number;
      direction: "up" | "down";
      scale: number;
    }) => Sprite,
    direction: "up" | "down" = "up",
  ) {
    const slashAnim = animationFn({
      x: target.x,
      y: target.y,
      direction: "up",
      scale: 1,
    });
    if (direction === "down") {
      slashAnim.scale.x = -1;
      slashAnim.scale.y = -1;
    }

    this.parent.addChild(slashAnim);
    gsap.to(slashAnim, {
      ease: "linear",
      duration: 0.2,
      onComplete: () => {
        this.parent.removeChild(slashAnim);
      },
    });
  }

  public multiAttack(
    targets: (Hero | Monster)[],
    animationFn: ({
      x,
      y,
      direction,
      scale,
    }: {
      x: number;
      y: number;
      direction: "up" | "down";
      scale: number;
    }) => Sprite,
    direction: "up" | "down" = "up",
  ) {
    const originalX = this.x;
    const originalY = this.y;

    gsap.to(this, {
      x: targets[0].x,
      y: targets[0].y,
      duration: 0.2,
      ease: "power1.out",
      onComplete: () => {
        targets.forEach((target, index) => {
          this.attack(target, animationFn, direction);
        });

        gsap.to(this, {
          x: originalX,
          y: originalY,
          duration: 0.2,
          ease: "power1.out",
        });
      },
    });
  }

  public rangeAttack(
    target: Hero | Monster,
    animationFn: ({
      x,
      y,
      direction,
      scale,
    }: {
      x: number;
      y: number;
      direction: "up" | "down";
      scale: number;
    }) => Sprite,
    direction: "up" | "down" = "up",
  ) {
    const originalX = this.x;
    const originalY = this.y;

    const animation = animationFn({
      x: originalX,
      y: originalY,
      direction,
      scale: 1,
    });
    this.parent.addChild(animation);

    gsap.fromTo(
      animation,
      {
        alpha: 0.1,
        x: originalX,
        y: originalY,
      },
      {
        alpha: 1,
        x: target.x,
        y: target.y,
        ease: "linear",
        duration: 0.4,
        onComplete: () => {
          this.parent.removeChild(animation);
        },
      },
    );
  }

  public multiRangeAttack(
    targets: (Hero | Monster)[],
    animationFn: ({
      x,
      y,
      direction,
      scale,
    }: {
      x: number;
      y: number;
      direction: "up" | "down";
      scale: number;
    }) => Sprite,
    direction: "up" | "down" = "up",
  ) {
    const originalX = this.x;
    const originalY = this.y;

    gsap.to(this, {
      y: direction === "up" ? originalY - 20 : originalY + 20,
      duration: 0.2,
      ease: "power1.out",
      onComplete: () => {
        targets.forEach((target, index) => {
          this.rangeAttack(target, animationFn, direction);
        });

        gsap.to(this, {
          x: originalX,
          y: originalY,
          duration: 0.2,
          ease: "power1.out",
        });
      },
    });
  }

  public unleashSlash(targets: (Hero | Monster)[], direction: "up" | "down") {
    this.multiAttack(targets, slashAnimation, direction);
  }

  public unleashFire(targets: (Hero | Monster)[], direction: "up" | "down") {
    this.multiRangeAttack(targets, fireAnimation, direction);
  }

  public unleashWind(targets: (Hero | Monster)[], direction: "up" | "down") {
    this.multiRangeAttack(targets, windAnimation, direction);
  }

  public unleashThunder(targets: (Hero | Monster)[], direction: "up" | "down") {
    this.multiRangeAttack(targets, thunderAnimation, direction);
  }
}
