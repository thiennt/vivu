import { Container, Sprite, Assets, Text, Graphics, Ticker } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { COLORS } from "../app";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";
import { fetchPlayerData, getCurrentPlayerId } from "../utils/playerApi";
import { PlayerData } from "../utils/common";

export class CharacterScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  // Main containers
  private background!: Graphics;
  private characterArea!: Container;
  private statsArea!: Container;
  private equipmentArea!: Container;
  private backButton!: FancyButton;

  // Character display elements
  private characterFrame!: Graphics;
  private avatar!: Sprite;
  private nameText!: Text;
  private levelText!: Text;
  private expText!: Text;

  // Stats elements
  private hpText!: Text;
  private atkText!: Text;
  private defText!: Text;
  private agiText!: Text;
  private critText!: Text;
  private hitRateText!: Text;

  // Point allocation elements
  private pointsText!: Text;
  private strText!: Text;
  private staText!: Text;
  private lukText!: Text;

  constructor() {
    super();

    this.createBackground();
    this.createLayout();
    this.loadPlayerData();
  }

  private createBackground() {
    this.background = new Graphics();
    this.background.rect(0, 0, 800, 600);
    this.background.fill(COLORS.lightBg);
    this.addChild(this.background);
  }

  private createLayout() {
    this.createBackButton();
    this.createCharacterArea();
    this.createStatsArea();
    this.createEquipmentArea();
  }

  private createBackButton() {
    this.backButton = new FancyButton();
    
    const backGraphic = new Graphics();
    backGraphic.roundRect(0, 0, 100, 40, 8);
    backGraphic.fill(COLORS.dustyBlue);
    backGraphic.stroke({ width: 2, color: COLORS.deepMagenta });
    
    this.backButton.defaultView = backGraphic;
    
    this.backButton.textView = new Text({
      text: "← Back",
      style: {
        fill: COLORS.warmCream,
        fontSize: 16,
        fontWeight: "bold",
      },
    });
    
    this.backButton.anchor.set(0.5, 0.5);
    this.backButton.x = 70;
    this.backButton.y = 30;
    
    this.backButton.onPress.connect(() => {
      navigation.showScreen(HomeScreen);
    });
    
    this.addChild(this.backButton);
  }

  private createCharacterArea() {
    this.characterArea = new Container();

    // Character panel background
    const charPanel = new Graphics();
    charPanel.roundRect(0, 0, 250, 300, 15);
    charPanel.fill(COLORS.dustyBlue);
    charPanel.stroke({ width: 3, color: COLORS.deepMagenta });
    this.characterArea.addChild(charPanel);

    // Character frame (avatar area)
    this.characterFrame = new Graphics();
    this.characterFrame.roundRect(20, 20, 80, 80, 10);
    this.characterFrame.fill(COLORS.goldAccent);
    this.characterFrame.stroke({ width: 2, color: COLORS.deepMagenta });
    this.characterArea.addChild(this.characterFrame);

    // Avatar placeholder
    try {
      this.avatar = new Sprite(Assets.get("stickman_1"));
      this.avatar.width = 70;
      this.avatar.height = 70;
      this.avatar.x = 25;
      this.avatar.y = 25;
      this.characterArea.addChild(this.avatar);
    } catch (error) {
      // Fallback avatar
      const avatarPlaceholder = new Graphics();
      avatarPlaceholder.circle(60, 60, 35);
      avatarPlaceholder.fill(COLORS.warmCream);
      avatarPlaceholder.stroke({ width: 2, color: COLORS.deepMagenta });
      this.characterArea.addChild(avatarPlaceholder);
    }

    // Character name
    this.nameText = new Text({
      text: "Loading...",
      style: {
        fill: COLORS.warmCream,
        fontSize: 18,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.nameText.x = 125;
    this.nameText.y = 40;
    this.nameText.anchor.set(0.5, 0);
    this.characterArea.addChild(this.nameText);

    // Character level
    this.levelText = new Text({
      text: "Level: --",
      style: {
        fill: COLORS.warmCream,
        fontSize: 14,
        fontWeight: "bold",
      },
    });
    this.levelText.x = 20;
    this.levelText.y = 120;
    this.characterArea.addChild(this.levelText);

    // Experience
    this.expText = new Text({
      text: "EXP: --",
      style: {
        fill: COLORS.warmCream,
        fontSize: 14,
        fontWeight: "bold",
      },
    });
    this.expText.x = 20;
    this.expText.y = 145;
    this.characterArea.addChild(this.expText);

    // Points allocation section
    const pointsLabel = new Text({
      text: "Attribute Points:",
      style: {
        fill: COLORS.warmCream,
        fontSize: 14,
        fontWeight: "bold",
      },
    });
    pointsLabel.x = 20;
    pointsLabel.y = 180;
    this.characterArea.addChild(pointsLabel);

    this.pointsText = new Text({
      text: "Available: --",
      style: {
        fill: COLORS.goldAccent,
        fontSize: 12,
        fontWeight: "bold",
      },
    });
    this.pointsText.x = 20;
    this.pointsText.y = 200;
    this.characterArea.addChild(this.pointsText);

    // Create attribute rows
    this.createAttributeRow("STR:", 20, 220, this.strText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createAttributeRow("STA:", 20, 240, this.staText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createAttributeRow("LUK:", 20, 260, this.lukText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));

    this.addChild(this.characterArea);
  }

  private createAttributeRow(label: string, x: number, y: number, valueText: Text) {
    const labelText = new Text({
      text: label,
      style: {
        fill: COLORS.warmCream,
        fontSize: 12,
        fontWeight: "bold",
      },
    });
    labelText.x = x;
    labelText.y = y;
    this.characterArea.addChild(labelText);

    valueText.x = x + 60;
    valueText.y = y;
    this.characterArea.addChild(valueText);
  }

  private createStatsArea() {
    this.statsArea = new Container();

    // Stats panel background
    const statsPanel = new Graphics();
    statsPanel.roundRect(0, 0, 200, 300, 15);
    statsPanel.fill(COLORS.dustyBlue);
    statsPanel.stroke({ width: 3, color: COLORS.deepMagenta });
    this.statsArea.addChild(statsPanel);

    // Stats title
    const statsTitle = new Text({
      text: "Combat Stats",
      style: {
        fill: COLORS.goldAccent,
        fontSize: 16,
        fontWeight: "bold",
        align: "center",
      },
    });
    statsTitle.x = 100;
    statsTitle.y = 15;
    statsTitle.anchor.set(0.5, 0);
    this.statsArea.addChild(statsTitle);

    // Create stats rows
    this.createStatRow("HP:", 20, 50, this.hpText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createStatRow("ATK:", 20, 75, this.atkText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createStatRow("DEF:", 20, 100, this.defText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createStatRow("AGI:", 20, 125, this.agiText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createStatRow("CRIT:", 20, 150, this.critText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));
    this.createStatRow("HIT:", 20, 175, this.hitRateText = new Text({text: "--", style: {fill: COLORS.warmCream, fontSize: 12}}));

    this.addChild(this.statsArea);
  }

  private createStatRow(label: string, x: number, y: number, valueText: Text) {
    const labelText = new Text({
      text: label,
      style: {
        fill: COLORS.warmCream,
        fontSize: 12,
        fontWeight: "bold",
      },
    });
    labelText.x = x;
    labelText.y = y;
    this.statsArea.addChild(labelText);

    valueText.x = x + 80;
    valueText.y = y;
    this.statsArea.addChild(valueText);
  }

  private createEquipmentArea() {
    this.equipmentArea = new Container();

    // Equipment panel background
    const equipPanel = new Graphics();
    equipPanel.roundRect(0, 0, 250, 300, 15);
    equipPanel.fill(COLORS.dustyBlue);
    equipPanel.stroke({ width: 3, color: COLORS.deepMagenta });
    this.equipmentArea.addChild(equipPanel);

    // Equipment title
    const equipTitle = new Text({
      text: "Equipment",
      style: {
        fill: COLORS.goldAccent,
        fontSize: 16,
        fontWeight: "bold",
        align: "center",
      },
    });
    equipTitle.x = 125;
    equipTitle.y = 15;
    equipTitle.anchor.set(0.5, 0);
    this.equipmentArea.addChild(equipTitle);

    // Equipment slots (placeholder)
    const comingSoon = new Text({
      text: "Coming Soon!",
      style: {
        fill: COLORS.warmCream,
        fontSize: 14,
        fontStyle: "italic",
        align: "center",
      },
    });
    comingSoon.x = 125;
    comingSoon.y = 150;
    comingSoon.anchor.set(0.5, 0.5);
    this.equipmentArea.addChild(comingSoon);

    this.addChild(this.equipmentArea);
  }

  private async loadPlayerData() {
    try {
      const playerData: PlayerData = await fetchPlayerData(getCurrentPlayerId());
      this.populatePlayerData(playerData);
    } catch (error) {
      console.error("Failed to load player data:", error);
    }
  }

  private populatePlayerData(data: PlayerData) {
    // Update character info
    this.nameText.text = data.player.character.name;
    this.levelText.text = `Level: ${data.player.level}`;
    this.expText.text = `EXP: ${data.player.exp}`;

    // Update attributes
    this.pointsText.text = `Available: ${data.player.points}`;
    this.strText.text = data.player.str.toString();
    this.staText.text = data.player.sta.toString();
    this.lukText.text = data.player.luck.toString();

    // Update stats
    this.hpText.text = data.player.character.hp.toString();
    this.atkText.text = data.player.character.atk.toString();
    this.defText.text = data.player.character.def.toString();
    this.agiText.text = data.player.character.agi.toString();
    this.critText.text = `${data.player.character.crit_rate}%`;
    this.hitRateText.text = `${data.player.character.hit_rate}%`;
  }

  public resize(width: number, height: number) {
    // Resize background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(COLORS.lightBg);

    // Position elements for responsive layout
    const centerX = width / 2;
    const padding = 20;

    // Character area on the left
    this.characterArea.x = Math.max(padding, centerX - 380);
    this.characterArea.y = 80;

    // Stats area in the middle
    this.statsArea.x = Math.max(padding + 270, centerX - 100);
    this.statsArea.y = 80;

    // Equipment area on the right
    this.equipmentArea.x = Math.min(width - 270, centerX + 120);
    this.equipmentArea.y = 80;
  }

  public update(_time: Ticker) {
    // Any animations or updates
  }
}