import { Container, Assets, Text, Graphics, Sprite } from "pixi.js";
import { navigation } from "../utils/navigation";
import { Enemy } from "./Enemy";
import { Player } from "./Player";

export class StatsArea extends Container {
  public player: Player;
  public enemy: Enemy;

  private area: Graphics;

  private hpIcon: Sprite;
  private atkIcon: Sprite;
  private defIcon: Sprite;
  private critIcon: Sprite;
  private agiIcon: Sprite;

  private playerHp: Text = new Text();
  private playerAtk: Text = new Text();
  private playerDef: Text = new Text();
  private playerCrit: Text = new Text();
  private playerAgi: Text = new Text();

  private enemyHp: Text = new Text();
  private enemyAtk: Text = new Text();
  private enemyDef: Text = new Text();
  private enemyCrit: Text = new Text();
  private enemyAgi: Text = new Text();

  constructor() {
    super();

    this.area = new Graphics()
      .roundRect(10, 0, navigation.width - 20, 240, 10)
      .fill("ffffff");
    //.stroke({ width: 1, color: "ffffff" });

    this.addChild(this.area);

    this.hpIcon = this.addIcon("hp");
    this.addChild(this.hpIcon);

    this.atkIcon = this.addIcon("atk");
    this.addChild(this.atkIcon);

    this.defIcon = this.addIcon("def");
    this.addChild(this.defIcon);

    this.critIcon = this.addIcon("crit");
    this.addChild(this.critIcon);

    this.agiIcon = this.addIcon("agi");
    this.addChild(this.agiIcon);

    this.addCharacterStats([
      this.playerHp,
      this.playerAtk,
      this.playerDef,
      this.playerCrit,
      this.playerAgi,
    ]);
    this.addCharacterStats([
      this.enemyHp,
      this.enemyAtk,
      this.enemyDef,
      this.enemyCrit,
      this.enemyAgi,
    ]);

    // this.statsBar = new Text({
    //     text: this.showStats(),
    //     style: {
    //         fontFamily: 'Arial',
    //         fontSize: 16,
    //         fill: { color: 0x000000, alpha: 1 },
    //         stroke: { color: 0x000000, width: 1 },
    //         wordWrap: true,
    //         wordWrapWidth: 440,
    //     }
    // });
    // this.statsBar.x = iconX + 15;
    // this.statsBar.y = y + padding;
    // this.scene.addChild(this.statsBar);
  }

  public addCharacterStats(stats: Text[]) {
    stats.forEach((stat: Text) => {
      stat.style = {
        fill: 0x5c5c5c,
        fontFamily: "Verdana",
        align: "center",
        fontSize: 28,
      };

      this.addChild(stat);
    });
  }

  addIcon(name) {
    const icon = new Sprite(Assets.get(name));
    icon.anchor = 0.5;
    icon.width = 32;
    icon.height = 32;
    //icon.position.set(x, y);

    return icon;
  }

  public resize(width: number, height: number) {
    // const div = height * 0.3;
    const centerX = width * 0.5;
    // const centerY = height * 0.5;

    this.hpIcon.position.set(centerX, 20);
    this.atkIcon.position.set(centerX, 70);
    this.defIcon.position.set(centerX, 120);
    this.critIcon.position.set(centerX, 170);
    this.agiIcon.position.set(centerX, 220);

    this.playerHp.position.set(centerX - 120, 2);
    this.playerAtk.position.set(centerX - 120, 52);
    this.playerDef.position.set(centerX - 120, 102);
    this.playerCrit.position.set(centerX - 120, 152);
    this.playerAgi.position.set(centerX - 120, 202);

    this.enemyHp.position.set(centerX + 90, 2);
    this.enemyAtk.position.set(centerX + 90, 52);
    this.enemyDef.position.set(centerX + 90, 102);
    this.enemyCrit.position.set(centerX + 90, 152);
    this.enemyAgi.position.set(centerX + 90, 202);
  }

  public async show() {
    //gsap.to(this.hpIcon, { x: navigation.width * 0.5, y: 10, duration: 0.1, ease: 'back.out' });
  }

  public prepare(player: Player, enemy: Enemy) {
    this.player = player;
    this.enemy = enemy;

    this.updateStats();
  }

  public updateHp() {
    let playerHp = this.player.stats.hp;
    playerHp = playerHp <= 0 ? 0 : playerHp;
    this.playerHp.text = playerHp + "/" + this.player.stats.maxHp;

    let enemyHp = this.enemy.stats.hp;
    enemyHp = enemyHp <= 0 ? 0 : enemyHp;
    this.enemyHp.text = enemyHp + "/" + this.enemy.stats.maxHp;
  }

  public updateStats() {
    this.playerHp.text = this.player.stats.hp + "/" + this.player.stats.maxHp;
    this.playerAtk.text = this.player.stats.atk.toString();
    this.playerDef.text = this.player.stats.def.toString();
    this.playerCrit.text = this.player.stats.crit.toString() + "%";
    this.playerAgi.text = this.player.stats.agi.toString();

    this.enemyHp.text = this.enemy.stats.hp + "/" + this.enemy.stats.maxHp;
    this.enemyAtk.text = this.enemy.stats.atk.toString();
    this.enemyDef.text = this.enemy.stats.def.toString();
    this.enemyCrit.text = this.enemy.stats.crit.toString() + "%";
    this.enemyAgi.text = this.enemy.stats.agi.toString();
  }
}
