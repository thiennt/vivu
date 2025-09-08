import {
  AnimatedSprite,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  Ticker,
} from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { Hero } from "./Hero";
import { Monster } from "./Monster";
import { COLORS } from "../app";
import { Character } from "./Character";
import { HomeScreen } from "../screens/HomeScreen";

export class CombatScene extends Container {
  private background: Sprite;

  private player1: Hero;
  private player2: Hero;
  private player3: Character;
  private player4: Character;
  private monster1: Monster;
  private monster2: Monster;
  private monster3: Character;
  private monster4: Character;

  private roundNote: Text;
  private backIcon: Sprite;

  private battleHistory: any[] = [];

  constructor() {
    super();

    console.log(Assets.cache);

    this.background = new Sprite(Assets.get("stage_1.jpg"));
    this.background.width = navigation.width;
    this.background.height = navigation.height;
    this.addChild(this.background);

    this.roundNote = new Text({
      text: "Round 1",
      style: { fontSize: 32, fill: 0xffffff },
    });
    this.roundNote.anchor.set(0.5);
    this.addChild(this.roundNote);

    this.backIcon = Sprite.from(Assets.get("back"));
    this.backIcon.anchor.set(0.5, 0.5);
    this.backIcon.interactive = true;
    this.backIcon.cursor = "pointer";
    this.backIcon.x = navigation.width - 60; // Changed from 50 to add 10px padding
    this.backIcon.y = 60; // Changed from 50 to add 10px padding
    this.backIcon.on("click", () => {
      navigation.showScreen(HomeScreen);
    });
    this.addChild(this.backIcon);

    this.player1 = new Hero({ rarity: "novice" });
    this.addChild(this.player1);

    this.player2 = new Hero({ rarity: "adept" });
    this.addChild(this.player2);

    this.player3 = new Character();
    this.addChild(this.player3);

    this.player4 = new Character();
    this.addChild(this.player4);

    this.monster1 = new Monster({
      rarity: "apprentice",
      name: "pipo-enemy001.png",
    });
    this.addChild(this.monster1);

    this.monster2 = new Monster({
      rarity: "expert",
      name: "pipo-enemy002.png",
    });
    this.addChild(this.monster2);

    this.monster3 = new Monster({
      rarity: "master",
      name: "pipo-enemy003.png",
    });
    this.addChild(this.monster3);

    this.monster4 = new Monster({
      rarity: "grandmaster",
      name: "pipo-enemy004.png",
    });
    this.addChild(this.monster4);

    this.battleHistory = [
      {
        round: 1,
        turn: 1,
        attacker: this.player1,
        targets: [{ target: this.monster1, is_hit: false, damage: 3 }],
        action_name: "unleashSlash",
        direction: "up",
      },
      {
        round: 1,
        turn: 2,
        attacker: this.monster1,
        targets: [{ target: this.player1, is_hit: false, damage: 1 }],
        action_name: "unleashFire",
        direction: "down",
      },
      {
        round: 1,
        turn: 3,
        attacker: this.player2,
        targets: [
          { target: this.monster2, is_hit: false, damage: 4 },
          { target: this.monster3, is_hit: false, damage: 7 },
        ],
        action_name: "unleashWind",
        direction: "up",
      },
      {
        round: 1,
        turn: 4,
        attacker: this.monster2,
        targets: [{ target: this.player2, is_hit: false, damage: 1 }],
        action_name: "unleashThunder",
        direction: "down",
      },
      {
        round: 2,
        turn: 5,
        attacker: this.player1,
        targets: [
          { target: this.monster1, is_hit: false, damage: 6 },
          { target: this.monster3, is_hit: false, damage: 6 },
        ],
        action_name: "unleashSlash",
        direction: "up",
      },
      {
        round: 2,
        turn: 6,
        attacker: this.monster1,
        targets: [{ target: this.player1, is_hit: false, damage: 4 }],
        action_name: "unleashFire",
        direction: "down",
      },
      {
        round: 2,
        turn: 7,
        attacker: this.player2,
        targets: [
          { target: this.monster2, is_hit: false, damage: 4 },
          { target: this.monster3, is_hit: false, damage: 7 },
        ],
        action_name: "unleashWind",
        direction: "up",
      },
      {
        round: 2,
        turn: 8,
        attacker: this.monster2,
        targets: [{ target: this.player2, is_hit: false, damage: 3 }],
        action_name: "unleashThunder",
        direction: "down",
      },
    ];
  }

  public async show() {
    for (let i = 0; i < this.battleHistory.length; i++) {
      const action = this.battleHistory[i];

      const attacker = action.attacker;
      const targetRows = action.targets;
      const targets = targetRows.map((t) => t.target);
      const actionName = action.action_name;
      const direction = action.direction;

      if (!attacker.isDie()) {
        await waitFor(1);

        attacker[actionName](targets, direction);
        await waitFor(0.4);
        this.checkDamages(targetRows);
      }

      if (i < this.battleHistory.length - 1) {
        this.roundNote.text = `Round ${this.battleHistory[i + 1].round}`;
      }
    }
  }

  public checkDamages(
    targetRows: { target: Hero | Monster; is_hit: boolean; damage: number }[],
  ) {
    targetRows.forEach((row) => {
      const target = row.target;
      const damage = row.damage;
      this.checkDamage(target, damage);
    });
  }

  public checkDamage(target: Hero | Monster, damage: number) {
    target.takeDamage(damage);

    if (target.stats.hp <= 0) {
      this.dieFlash(target);
    } else {
      this.damageFlash(target, damage);
    }
  }

  public damageFlash(target: Hero | Monster, damage: number) {
    const originalX = target.x;
    const originalY = target.y;

    gsap.to(target, {
      x: originalX + (Math.random() * 10 - 5),
      y: originalY + (Math.random() * 10 - 5),
      duration: 0.2,
      repeat: 3,
      yoyo: true,
      onComplete: () => {
        target.x = originalX;
        target.y = originalY;
      },
    });

    const damageImage = Assets.get("damage_flash");
    const damageSprite = new Sprite(damageImage);
    damageSprite.x = originalX;
    damageSprite.y = originalY;
    damageSprite.anchor.set(0.5);
    damageSprite.scale.set(0.4);
    this.addChild(damageSprite);

    gsap.to(damageSprite, {
      duration: 0.4,
      ease: "power3.out",
      onComplete: () => {
        this.removeChild(damageSprite);
      },
    });

    const damageText = new Text({
      text: `-${damage}`,
      style: { fontSize: 24, fill: 0xff0000 },
    });
    damageText.anchor.set(0.5);
    damageText.x = originalX;
    damageText.y = originalY;
    this.addChild(damageText);

    gsap.to(damageText, {
      duration: 0.4,
      ease: "power3.out",
      onComplete: () => {
        this.removeChild(damageText);
      },
    });
  }

  public dieFlash(target: Hero | Monster) {
    const targetX = target.x;
    const targetY = target.y;

    const textures = Assets.get("effects").textures;
    const animation = new AnimatedSprite([
      textures.explosion_1,
      textures.explosion_2,
      textures.explosion_3,
      textures.explosion_4,
      textures.explosion_5,
    ]);
    animation.x = targetX;
    animation.y = targetY;
    animation.anchor.set(0.5);
    animation.animationSpeed = 0.2;
    animation.loop = false;
    animation.scale.set(1);
    animation.gotoAndPlay(0);

    this.removeChild(target);
    this.addChild(animation);

    gsap.to(animation, {
      duration: 0.4,
      ease: "power3.out",
      onComplete: () => {
        this.removeChild(animation);
        const character = new Character();
        character.x = targetX;
        character.y = targetY;

        this.addChild(character);
      },
    });
  }

  public screenShake() {
    const originalX = this.x;
    const originalY = this.y;

    gsap.to(this, {
      x: originalX + (Math.random() * 10 - 5),
      y: originalY + (Math.random() * 10 - 5),
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        this.x = originalX;
        this.y = originalY;
      },
    });
  }

  public async hide() {}

  public prepare() {}

  public resize(width: number, height: number) {
    const centerY = height / 2;
    this.roundNote.position.set(width / 2, 60); // Changed from 50 to 60 for 10px padding

    // Adjust character positions to respect 10px padding
    this.player1.position.set(width / 2 - 100, centerY + 150);
    this.player2.position.set(width / 2 + 100, centerY + 150);
    this.player3.position.set(width / 2 - 100, centerY + 300);
    this.player4.position.set(width / 2 + 100, centerY + 300);

    this.monster1.position.set(width / 2 - 100, centerY - 150);
    this.monster2.position.set(width / 2 + 100, centerY - 150);
    this.monster3.position.set(width / 2 - 100, centerY - 300);
    this.monster4.position.set(width / 2 + 100, centerY - 300);
  }

  public update(time: Ticker) {}
}
