import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { StatsArea } from "./StatsArea";

export class CombatScene extends Container {
  private duelContainer: Container;
  private statsContainer: Container;
  private player: Player;
  private enemy: Enemy;
  private statsArea: StatsArea;

  private gameState = 0; // 0: start, 1: end
  private elapsedSeconds = 0;
  private turn = 0; // 0: player turn, 1: enemy turn

  constructor() {
    super();

    this.duelContainer = new Container();
    this.addChild(this.duelContainer);

    this.player = new Player();
    this.duelContainer.addChild(this.player);

    this.enemy = new Enemy();
    this.duelContainer.addChild(this.enemy);

    this.statsContainer = new Container();
    this.addChild(this.statsContainer);

    this.statsArea = new StatsArea();
    this.statsContainer.addChild(this.statsArea);
  }

  public async show() {}

  public prepare() {
    this.statsArea.prepare(this.player, this.enemy);

    this.turn = this.player.stats.agi >= this.enemy.stats.agi ? 0 : 1; // 0: hero turn, 1: monster turn
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;

    this.player.x = centerX - 60;
    this.player.y = -42;
    this.enemy.x = centerX + 60;
    this.enemy.y = -50;

    this.statsContainer.x = 0;
    this.statsContainer.y = -450;

    this.statsArea.resize(width, height);
  }

  public update(time: Ticker) {
    if (this.gameState == 1) return;

    this.elapsedSeconds += time.deltaMS / 1000;
    if (this.elapsedSeconds >= 1.5) {
      if (this.turn == 0) {
        this.playerFight();
        this.turn = 1;
      } else {
        this.enemyFight();
        this.turn = 0;
      }

      if (this.player.stats.hp <= 0 || this.enemy.stats.hp <= 0) {
        this.gameState = 1;
      }

      this.statsArea.updateHp();
      this.elapsedSeconds = 0;
    }
  }

  public async playerFight() {
    let attack = this.player.fight();
    let delayTime = 1.6;

    if (attack.isCrit) {
      this.player.character.textures = this.player.animations.crit;
    } else {
      this.player.character.textures = this.player.animations.fight;
      delayTime = 0.8;
    }

    //this.player.x += 60;
    gsap.to(this.player, {
      x: this.player.x + 70,
      duration: 0.1,
      ease: "back.out",
    });
    this.player.character.animationSpeed = 0.1;
    this.player.character.gotoAndPlay(0);

    this.enemy.takeDamage(attack.damage, attack.hitRate);

    await waitFor(delayTime);

    this.player.idle();
    gsap.to(this.player, {
      x: this.player.x - 70,
      duration: 0.1,
      ease: "back.out",
    });
  }

  public async enemyFight() {
    let attack = this.enemy.fight();
    let delayTime = 1.2;

    if (attack.isCrit) {
      this.enemy.character.textures = this.enemy.animations.crit;
    } else {
      this.enemy.character.textures = this.enemy.animations.fight;
      delayTime = 0.6;
    }

    gsap.to(this.enemy, {
      x: this.enemy.x - 60,
      duration: 0.1,
      ease: "back.out",
    });
    this.enemy.character.animationSpeed = 0.1;
    this.enemy.character.gotoAndPlay(0);

    this.player.takeDamage(attack.damage, attack.hitRate);

    await waitFor(delayTime);
    this.enemy.idle();
    gsap.to(this.enemy, {
      x: this.enemy.x + 60,
      duration: 0.1,
      ease: "back.out",
    });
  }
}
