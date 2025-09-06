import { Assets, Container, Graphics, Sprite, Text, Ticker } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { CombatScreen } from "./CombatScreen";
import { HomeScreen } from "./HomeScreen";
import { COLORS } from "../app";
import { FancyButton } from "@pixi/ui";
import { fetchStagesByPlayer } from "../utils/api";
import { getCurrentPlayerId } from "../utils/playerApi";
import { StageData } from "../utils/common";
import { StageScreen } from "./StageScreen";

export class DungeonScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private backIcon: Sprite;
  private stageData: StageData | null = null;

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

  public async addStages() {
    try {
      // Fetch player data from API
      this.stageData = await fetchStagesByPlayer(getCurrentPlayerId());

      // Populate UI with fetched data
      this.populateStageData(this.stageData);
    } catch (error) {
      console.error("Failed to load player data:", error);
    }
  }

  public populateStageData(stageData: StageData) {
    if (!stageData || !stageData.stages) {
      console.error("No stage data available");
      return;
    }

    for (let index = 0; index < stageData.stages.length; index++) {
      const stageSprite = new Sprite(Assets.get(`stage_1_thumbnail.jpg`));
      stageSprite.anchor.set(0.5);
      stageSprite.width = navigation.width - 40;
      stageSprite.height = 200;
      stageSprite.x = navigation.width / 2;
      stageSprite.y = 200 + index * 220;
      stageSprite.interactive = true;
      stageSprite.cursor = "pointer";
      stageSprite.on("click", () => {
        navigation.showScreen(StageScreen, {
          stage_id: stageData.stages[index].id,
        });
      });
      this.addChild(stageSprite);
      this.createStageText(stageSprite.x + 50, stageSprite.y, "Stage 1");
    }
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
