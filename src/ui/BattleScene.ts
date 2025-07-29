import { Container, Ticker, Text } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";
import { testForAABB } from "../utils/common";
import { FrameIntegration } from "../utils/FrameIntegration";

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

  // Frame integration
  private frameIntegration: FrameIntegration;
  private frameGameState: any;

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

    // Initialize Frame integration
    this.frameIntegration = new FrameIntegration();
    this.frameIntegration.showFrameInfo();
  }

  public async prepare() {
    // Load Frame state if in Frame context
    if (this.frameIntegration.isFrame()) {
      this.frameGameState = await this.frameIntegration.loadGameState();
      if (this.frameGameState) {
        // Apply Frame state to game characters
        this.applyFrameStateToGame();
      }
    }

    this.statsArea.prepare(this.player, this.enemy);
    this.player.run();
  }

  private applyFrameStateToGame(): void {
    if (!this.frameGameState) return;

    // Apply player stats from Frame
    this.player.stats.hp = this.frameGameState.playerStats.hp;
    this.player.stats.attack = this.frameGameState.playerStats.attack;
    this.player.stats.defense = this.frameGameState.playerStats.defense;
    this.player.stats.critical = this.frameGameState.playerStats.critical;
    this.player.stats.agility = this.frameGameState.playerStats.agility;

    // Apply enemy stats from Frame
    this.enemy.stats.hp = this.frameGameState.enemyStats.hp;
    this.enemy.stats.attack = this.frameGameState.enemyStats.attack;
    this.enemy.stats.defense = this.frameGameState.enemyStats.defense;
    this.enemy.stats.critical = this.frameGameState.enemyStats.critical;
    this.enemy.stats.agility = this.frameGameState.enemyStats.agility;

    // Check if game is over in Frame
    if (this.frameGameState.gameOver) {
      this.gameState = 2; // End game state
      this.showGameOverMessage(this.frameGameState.winner);
    }
  }

  private showGameOverMessage(winner: string): void {
    const gameOverText = new Text();
    gameOverText.style = {
      fontFamily: "Arial",
      fontSize: 48,
      fill: winner === "player" ? 0x00aa00 : 0xaa0000,
      align: "center",
    };
    gameOverText.anchor.set(0.5, 0.5);
    gameOverText.x = navigation.width * 0.5;
    gameOverText.y = -100;
    gameOverText.text = winner === "player" ? "You Win!" : "You Lose!";
    this.addChild(gameOverText);
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

    // Sync with Frame state periodically
    if (this.frameIntegration.isFrame()) {
      await this.syncWithFrameState();
    }

    if (this.gameState == 0) {
      this.statsElapsedSeconds += time.deltaMS / 1000;
      this.player.move(); // Move the player to the right

      if (this.player.x >= this.enemy.x - 60) {
        this.gameState = 2; // end the game
      }

      if (this.statsElapsedSeconds >= 0.5) {
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

  private async syncWithFrameState(): Promise<void> {
    // Update Frame with current game state
    const currentGameState = {
      playerHp: this.player.stats.hp,
      playerMaxHp: this.player.stats.hp, // Assuming max HP stays same
      enemyHp: this.enemy.stats.hp,
      enemyMaxHp: this.enemy.stats.hp,
      playerStats: this.player.stats,
      enemyStats: this.enemy.stats,
      turn: "player", // In PixiJS version, it's more like real-time
      gameOver: this.gameState === 2,
      winner: this.gameState === 2 ? "player" : null, // Simplified for now
      lastAction: "Battle in progress...",
      battlePhase: "combat",
    };

    await this.frameIntegration.updateFrame(currentGameState);
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

    let message = new Text();
    message.style = {
      fontFamily: "Arial",
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
