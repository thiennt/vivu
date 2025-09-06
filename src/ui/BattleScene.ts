import { Container, Ticker, Text } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";
import { testForAABB } from "../utils/common";

import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { StatsArea } from "./StatsArea";
import { StatsSelection } from "../ui/StatsSelection";

export class BattleScene extends Container {
  private duelContainer: Container;
  private statsContainer: Container;
  private player: Player;
  private enemy: Enemy;
  private statsArea: StatsArea;

  private statsSelection: StatsSelection;
  private statsElapsedSeconds = 0;
  private gameState = 0; // 0: begin, 1: stop to choose stats, 2: end

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

    this.statsSelection = new StatsSelection();
    this.addChild(this.statsSelection);
  }

  public prepare() {
    this.statsArea.prepare(this.player, this.enemy);

    this.player.run();
  }

  public async show() {
    //this.startBattle();
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;

    this.player.x = centerX - 200;
    this.player.y = -42;
    this.enemy.x = centerX + 200;
    this.enemy.y = -50;

    this.statsContainer.x = 0;
    this.statsContainer.y = -450;

    this.statsArea.resize(width, height);
  }

  public async update(time: Ticker) {
    if (this.gameState == 2) return;

    if (this.gameState == 0) {
      this.statsElapsedSeconds += time.deltaMS / 1000;
      this.player.move(); // Move the player to the right

      if (this.player.x >= this.enemy.x - 60) {
        this.gameState = 2; // end the game
      }

      if (this.statsElapsedSeconds >= 1) {
        this.gameState = 1; // Stop the game to choose stats

        this.statsSelection.showSelection(this.player, this.enemy);
        this.statsSelection.onSelection = (
          character,
          statsName,
          statsValue,
        ) => {
          this.onSelection(character, statsName, statsValue);
        };
        this.statsElapsedSeconds = 0;
      }
    }
  }

  public onSelection(
    character: Player | Enemy,
    statsName: string,
    statsValue: number,
  ) {
    this.gameState = 0; // continue the game
    this.statsSelection.removeChildren(); // Clear previous selections

    if (character instanceof Player) {
      this.player.applyStats(statsName, statsValue);
    } else {
      this.enemy.applyStats(statsName, statsValue);
    }

    this.statsArea.updateStats();

    const message = new Text();
    message.style = {
      fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
      fontSize: 24,
      fill: 0x000000,
      align: "center",
    };
    message.anchor.set(0.5, 0.5);
    message.x = navigation.width * 0.5;
    message.y = -180;
    message.text = `${character instanceof Player ? "Player:" : "Enemy:"} ${statsValue}% ${statsName.toUpperCase()}`;

    let textLabel = `${statsValue} ${statsName.toUpperCase()}`;
    if (statsValue > 0) {
      textLabel = `+${statsValue} ${statsName.toUpperCase()}`;
    } else if (statsValue < 0) {
      textLabel = `${statsValue} ${statsName.toUpperCase()}`;
    }
    message.text = `${character instanceof Player ? "Player:" : "Enemy:"} ${textLabel}`;
    this.addChild(message);
    gsap.to(message, {
      duration: 1,
      alpha: 1,
      onComplete: () => {
        this.removeChild(message);
      },
    });
  }
}
