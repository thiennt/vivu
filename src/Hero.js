import { AnimatedSprite, Assets, Graphics, Text } from "pixi.js";
import { delay, getRandomItemByRate } from "./util.js";
import { Bullet } from "./Bullet.js";

export class Hero {
  constructor(app, scene) {
    this.app = app;
    this.scene = scene;
    // The character's state.
    this.state = {
      idle: false,
      fight: false,
    };

    this.bullets = [];
    this.stats = {
      hp: 16,
      maxHp: 16,
      atk: 5,
      def: 5,
      crit: 20,
      agi: 3,
    };

    this.baseHitRate = 65;
  }

  init() {
    // this.sheet = await Assets.load('stickman');
    // this.sprite = new AnimatedSprite(this.sheet.animations.idle);
    this.sheet = this.scene.heroSheet;
    this.sprite = this.scene.heroSprite;
    this.sprite.anchor = 0.5;
    this.sprite.scale.set(1);
    // this.sprite.width = 40;
    // this.sprite.height = 80;
    this.sprite.play();
    this.sprite.animationSpeed = 0.05;
    this.sprite.position.set(
      this.app.canvas.width / 2 - 50,
      this.scene.LINE_Y - 42,
    );

    this.addStatsBar();
    this.addHpBar();
  }

  addStatsBar() {
    let y = this.scene.LINE_Y - 400;
    let padding = 5;

    let rec = new Graphics().roundRect(padding, y, 190, 220, 10).fill("ffffff");
    //.stroke({ width: 1, color: "ffffff" });

    this.scene.addChild(rec);

    let iconX = 10 + padding;

    let hpIcon = this.addIcon("hp", iconX, y + 52);
    this.scene.addChild(hpIcon);

    let atkIcon = this.addIcon("atk", iconX, y + 87);
    this.scene.addChild(atkIcon);

    let defIcon = this.addIcon("def", iconX, y + 122);
    this.scene.addChild(defIcon);

    let critIcon = this.addIcon("crit", iconX, y + 157);
    this.scene.addChild(critIcon);

    let agiIcon = this.addIcon("agi", iconX, y + 194);
    this.scene.addChild(agiIcon);

    this.statsBar = new Text({
      text: this.showStats(),
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: { color: 0x000000, alpha: 1 },
        stroke: { color: 0x000000, width: 1 },
        wordWrap: true,
        wordWrapWidth: 440,
      },
    });
    this.statsBar.x = iconX + 15;
    this.statsBar.y = y + padding;
    this.scene.addChild(this.statsBar);
  }

  addIcon(name, x, y) {
    let animations = this.scene.skillsSheet.animations;
    let icon = new AnimatedSprite(animations[name]);
    icon.anchor = 0.5;
    icon.width = 16;
    icon.height = 16;
    icon.position.set(x, y);

    return icon;
  }

  showStats() {
    let statsText = `HERO \n\n`;
    statsText += `HP: ${this.stats.hp}/${this.stats.maxHp} \n\n`;
    statsText += `ATK: ${this.stats.atk} \n\n`;
    statsText += `DEF: ${this.stats.def} \n\n`;
    statsText += `CRIT: ${this.stats.crit}% \n\n`;
    statsText += `AGI: ${this.stats.agi} \n`;

    return statsText;
  }

  addHpBar() {
    let x = this.sprite.position.x - 30;
    let y = this.sprite.position.y - 70;

    this.maxHpBar = new Graphics().rect(x, y, 70, 5).fill({ color: "000000" });
    this.scene.addChild(this.maxHpBar);

    this.hpBar = new Graphics().rect(x, y, 70, 5).fill({ color: 0x666666 });
    this.scene.addChild(this.hpBar);
  }

  updateStats() {
    this.statsBar.text = this.showStats();

    let x = this.sprite.position.x - 30;
    let y = this.sprite.position.y - 70;

    let healthPercentage = this.stats.hp / this.stats.maxHp;

    this.maxHpBar.clear().rect(x, y, 70, 5).fill({ color: "000000" });

    this.hpBar
      .clear()
      .rect(x, y, 70 * healthPercentage, 5)
      .fill({ color: 0x666666 });
  }

  fight() {
    let critRate = [
      { value: false, rate: 100 - this.stats.crit },
      { value: true, rate: this.stats.crit },
    ];
    let isCrit = getRandomItemByRate(critRate).value;
    let damage = isCrit ? this.stats.atk * 2 : this.stats.atk;
    let hitRate = this.baseHitRate + this.stats.agi;

    return { isCrit: isCrit, damage: damage, hitRate: hitRate };
  }
}
