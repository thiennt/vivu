import { Assets, Container, Graphics, Sprite, Text, Ticker } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { DuelScene } from "../ui/DuelScene";
import { CombatScene } from "../ui/CombatScene";
import { CombatScreen, StagesScreen } from "./CombatScreen";
import { HomeScreen } from "./HomeScreen";
import { COLORS } from "../app";
import { FancyButton } from "@pixi/ui";

export class DungeonScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private backIcon: Sprite;

  constructor() {
    super();

    const background = new Sprite(Assets.get("background_1.png"));
    background.width = navigation.width;
    background.height = navigation.height;
    this.addChild(background);

    this.backIcon = Sprite.from(Assets.get("back"));
    this.backIcon.anchor.set(0.5, 0.5);
    this.backIcon.interactive = true;
    this.backIcon.cursor = "pointer";
    this.backIcon.x = navigation.width - 50;
    this.backIcon.y = 50;
    this.backIcon.on("click", () => {
      navigation.showScreen(HomeScreen);
    });
    this.addChild(this.backIcon);

    this.addStages();
  }

  public addStages() {
    const stage = new Sprite(Assets.get(`stage_1_thumbnail.jpg`));
    stage.anchor.set(0.5);
    stage.width = navigation.width - 40;
    stage.height = 200;
    stage.x = navigation.width / 2;
    stage.y = 200;
    stage.interactive = true;
    stage.cursor = "pointer";
    stage.on("click", () => {
      navigation.showScreen(CombatScreen);
    });
    this.addChild(stage);
    this.createStageText(stage.x + 50, stage.y, "Stage 1");
  }

  public createStageText(x: number, y: number, stageName: string) {
    const graphic = new Graphics();
    graphic.roundRect(0, 0, 100, 40, 5);
    graphic.stroke({ width: 2, color: COLORS.blueDark });
    graphic.fill(COLORS.blueLight);

    const textBtn = new FancyButton();
    //textBtn.defaultView = graphic;

    textBtn.textView = new Text({
      text: stageName,
      style: {
        fill: COLORS.white,
        fontSize: 24,
        fontWeight: "bold",
      },
    });
    textBtn.defaultTextScale = 1;
    textBtn.defaultTextAnchor = {
      x: 0.5,
      y: 0.5,
    };
    textBtn.textOffset = { x: 0, y: 0 };
    textBtn.padding = 10;
    textBtn.anchor.set(0.5, 0.5);
    textBtn.x = x - 50;
    textBtn.y = y;
    this.addChild(textBtn);
  }
}
