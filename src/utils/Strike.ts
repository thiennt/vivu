import { AnimatedSprite, Assets, Container, Graphics, Sprite } from "pixi.js";
import { getRandomItemByRate } from "../utils/common";
import { Player } from "../ui/Player";

export class Strike extends Container {
  public sprite: Graphics;

  public stats: {
    atk: number;
    crit: number;
  } = {
    atk: 0,
    crit: 0,
  };

  constructor() {
    super();

    this.sprite = new Graphics();
    this.addChild(this.sprite);
  }

  public init(
    stats: { atk: number; crit: number },
    x: number = 0,
    y: number = 0,
  ) {
    this.stats.atk = stats.atk;
    this.stats.crit = stats.crit;

    this.x = x;
    this.y = y;

    this.calculateDamage();
  }

  public move() {
    this.sprite.x += 1;
  }

  public calculateDamage() {
    // check if critial strike occurs
    const critRate = [
      { value: 0, rate: 100 - this.stats.crit },
      { value: 1, rate: this.stats.crit },
    ];

    const isCrit = getRandomItemByRate(critRate);
    if (isCrit.value == 1) {
      this.stats.atk *= 2;
      this.show(0xffff00);
    } else {
      this.show(0x000000);
    }
  }

  public show(color: number = 0x000000) {
    this.sprite
      .clear()
      .circle(this.x + 20, this.y - 20, 5)
      .fill({
        color: color,
        alpha: 1,
      });
  }

  public hit(enemyX: number): Sprite | null {
    if (this.sprite.x >= enemyX - 40) {
      const boomEffect = Assets.get("boom");
      const boom = new Sprite(boomEffect);
      boom.anchor.set(0.5);
      boom.x = this.sprite.x + 40;
      boom.y = this.sprite.y - 60;
      return boom; // Strike hits the enemy
    }
    return null; // Strike misses the enemy
  }
}
