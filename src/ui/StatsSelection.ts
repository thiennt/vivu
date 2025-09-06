import { Assets, Container, Sprite, Text } from "pixi.js";
import { getRandomItemByRate, getRandomItems } from "../utils/common";
import { Player } from "./Player";
import { Enemy } from "./Enemy";

export class StatsSelection extends Container {
  private stats: { [key: string]: { value: number; rate: number }[] } = {};

  public onSelection: (
    character: Player | Enemy,
    statsName: string,
    statsValue: number,
  ) => void = () => {};

  constructor() {
    super();

    this.stats = {
      atk: [
        { value: 1, rate: 0.1 },
        { value: 2, rate: 0.1 },
        { value: 3, rate: 0.1 },
        { value: 4, rate: 0.1 },
        { value: 5, rate: 0.1 },
        { value: -1, rate: 0.1 },
        { value: -2, rate: 0.1 },
        { value: -3, rate: 0.1 },
        { value: -4, rate: 0.1 },
        { value: -5, rate: 0.1 },
      ],
      crit: [
        { value: 5, rate: 0.1 },
        { value: 10, rate: 0.1 },
        { value: 15, rate: 0.1 },
        { value: 20, rate: 0.1 },
        { value: 25, rate: 0.1 },
        { value: -5, rate: 0.1 },
        { value: -10, rate: 0.1 },
        { value: -15, rate: 0.1 },
        { value: -20, rate: 0.1 },
        { value: -25, rate: 0.1 },
      ],
      def: [
        { value: 1, rate: 0.1 },
        { value: 2, rate: 0.1 },
        { value: 3, rate: 0.1 },
        { value: 4, rate: 0.1 },
        { value: 5, rate: 0.1 },
        { value: -1, rate: 0.1 },
        { value: -2, rate: 0.1 },
        { value: -3, rate: 0.1 },
        { value: -4, rate: 0.1 },
        { value: -5, rate: 0.1 },
      ],
      hp: [
        { value: 1, rate: 0.1 },
        { value: 2, rate: 0.1 },
        { value: 3, rate: 0.1 },
        { value: 4, rate: 0.1 },
        { value: 5, rate: 0.1 },
        { value: -1, rate: 0.1 },
        { value: -2, rate: 0.1 },
        { value: -3, rate: 0.1 },
        { value: -4, rate: 0.1 },
        { value: -5, rate: 0.1 },
      ],
      agi: [
        { value: 1, rate: 0.1 },
        { value: 2, rate: 0.1 },
        { value: 3, rate: 0.1 },
        { value: 4, rate: 0.1 },
        { value: 5, rate: 0.1 },
        { value: -1, rate: 0.1 },
        { value: -2, rate: 0.1 },
        { value: -3, rate: 0.1 },
        { value: -4, rate: 0.1 },
        { value: -5, rate: 0.1 },
      ],
    };
  }

  public addSelection(
    statsName: string,
    statsValue: number,
    character: Player | Enemy,
  ) {
    const pos = character.position;
    const posX = pos.x;
    const posY = pos.y - 110;

    // Card Stats
    const icon = new Sprite(Assets.get(statsName));
    icon.anchor = 0.5;
    //icon.scale = 0.7;
    icon.width = 36;
    icon.height = 36;
    icon.visible = true;
    icon.position.set(posX, posY);

    icon.interactive = true;
    icon.cursor = "pointer";

    icon.on("pointerdown", () => {
      this.onSelection(character, statsName, statsValue);
    });
    this.addChild(icon);

    // Card text
    let cardColor = "000000";
    let textLabel = `${statsValue} ${statsName.toUpperCase()}`;

    if (statsValue > 0) {
      cardColor = "ffffff";
      textLabel = `+${statsValue} ${statsName.toUpperCase()}`;
    }

    const text = new Text();
    text.text = textLabel;
    text.style = {
      fontFamily: "Arial",
      fontSize: 12,
      fill: { color: "000000", alpha: 1 },
      //stroke: { color: "000000", width: 1 },
      //wordWrap: true,
      //wordWrapWidth: 50,
      align: "center",
    };
    text.visible = true;
    text.anchor.set(0.5, 0.5);
    text.x = posX;
    text.y = posY + 30;
    this.addChild(text);
  }

  public addPlayerStatsSelection(character: Player | Enemy) {
    const statsName = getRandomItems(["atk", "def", "hp", "crit", "agi"], 1)[0];
    const statsValue = this.getstatsValue(statsName)?.value;

    this.addSelection(statsName, statsValue, character);
  }

  public addEnemyStatsSelection(character: Player | Enemy) {
    const statsName = getRandomItems(["atk", "def", "hp", "crit", "agi"], 1)[0];
    const statsValue = this.getstatsValue(statsName)?.value;

    this.addSelection(statsName, statsValue, character);
  }

  public getstatsValue(statsName: string): { key: string; value: any } | null {
    return getRandomItemByRate(this.stats[statsName]);
  }

  public showSelection(player: Player, enemy: Enemy) {
    this.addPlayerStatsSelection(player);
    this.addEnemyStatsSelection(enemy);
  }
}
