import { Container, Sprite, Assets, Text, Graphics, Ticker } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { COLORS } from "../app";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";

// Mock stage data interface
export interface StageData {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  background_url: string;
  difficulty: "easy" | "normal" | "hard" | "expert";
  completed: boolean;
  locked: boolean;
  chapter: number;
  stageNumber: number;
  rewards?: string[];
}

export class DungeonScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background!: Graphics;
  private backButton!: FancyButton;
  private titleText!: Text;
  private chapterTabs!: Container;
  private stagesContainer!: Container;
  private stages: StageData[] = [];
  private currentChapter = 1;

  constructor() {
    super();

    this.createBackground();
    this.createHeader();
    this.initStageData();
    this.createChapterTabs();
    this.createStagesView();
  }

  private createBackground() {
    this.background = new Graphics();
    this.background.rect(0, 0, 800, 600);
    this.background.fill(COLORS.darkBg);
    this.addChild(this.background);
  }

  private createHeader() {
    // Back button
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

    // Title
    this.titleText = new Text({
      text: "Crypto Dungeons",
      style: {
        fill: COLORS.goldAccent,
        fontSize: 32,
        fontWeight: "bold",
        align: "center",
        dropShadow: {
          alpha: 0.8,
          angle: 45,
          blur: 3,
          color: COLORS.shadowGray,
          distance: 3,
        },
      },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = 400;
    this.titleText.y = 20;
    this.addChild(this.titleText);
  }

  private initStageData() {
    // Create mock stage data for multiple chapters
    this.stages = [
      // Chapter 1: Bitcoin Genesis
      {
        id: "btc_1_1",
        name: "Genesis Block",
        description: "The very first step into the crypto world",
        thumbnail_url: "stage_1_thumbnail.jpg",
        background_url: "background_1.png",
        difficulty: "easy",
        completed: true,
        locked: false,
        chapter: 1,
        stageNumber: 1,
        rewards: ["100 BTC Coins", "Basic Sword"]
      },
      {
        id: "btc_1_2", 
        name: "Mining Pools",
        description: "Learn the power of collective mining",
        thumbnail_url: "stage_2_thumbnail.jpg",
        background_url: "background_2.png",
        difficulty: "easy",
        completed: true,
        locked: false,
        chapter: 1,
        stageNumber: 2,
        rewards: ["150 BTC Coins", "Mining Helmet"]
      },
      {
        id: "btc_1_3",
        name: "Halving Event",
        description: "Face the mysterious halving phenomenon",
        thumbnail_url: "stage_3_thumbnail.jpg",
        background_url: "background_3.png",
        difficulty: "normal",
        completed: false,
        locked: false,
        chapter: 1,
        stageNumber: 3,
        rewards: ["200 BTC Coins", "Halving Axe"]
      },
      {
        id: "btc_1_4",
        name: "Lightning Strike",
        description: "Master the Lightning Network",
        thumbnail_url: "stage_4_thumbnail.jpg",
        background_url: "background_4.png",
        difficulty: "normal",
        completed: false,
        locked: true,
        chapter: 1,
        stageNumber: 4,
        rewards: ["300 BTC Coins", "Lightning Staff"]
      },

      // Chapter 2: Ethereum Smart Contracts
      {
        id: "eth_2_1",
        name: "Smart Contract Academy",
        description: "Learn the basics of smart contracts",
        thumbnail_url: "stage_5_thumbnail.jpg",
        background_url: "background_5.png",
        difficulty: "normal",
        completed: false,
        locked: false,
        chapter: 2,
        stageNumber: 1,
        rewards: ["100 ETH Coins", "Contract Scroll"]
      },
      {
        id: "eth_2_2",
        name: "DeFi Protocols",
        description: "Navigate the complex world of DeFi",
        thumbnail_url: "stage_6_thumbnail.jpg",
        background_url: "background_6.png",
        difficulty: "hard",
        completed: false,
        locked: true,
        chapter: 2,
        stageNumber: 2,
        rewards: ["200 ETH Coins", "DeFi Shield"]
      },

      // Chapter 3: Altcoin Adventures
      {
        id: "alt_3_1",
        name: "Solana Speed Trial",
        description: "Test your speed in the Solana realm",
        thumbnail_url: "stage_7_thumbnail.jpg",
        background_url: "background_7.png",
        difficulty: "hard",
        completed: false,
        locked: true,
        chapter: 3,
        stageNumber: 1,
        rewards: ["150 SOL Coins", "Speed Boots"]
      },
    ];
  }

  private createChapterTabs() {
    this.chapterTabs = new Container();
    
    const chapters = [1, 2, 3];
    const tabWidth = 150;
    const tabSpacing = 10;
    
    chapters.forEach((chapter, index) => {
      const tab = this.createChapterTab(chapter, index === 0);
      tab.x = index * (tabWidth + tabSpacing);
      this.chapterTabs.addChild(tab);
    });

    this.chapterTabs.x = (800 - (chapters.length * (tabWidth + tabSpacing) - tabSpacing)) / 2;
    this.chapterTabs.y = 80;
    this.addChild(this.chapterTabs);
  }

  private createChapterTab(chapter: number, isActive: boolean): FancyButton {
    const tab = new FancyButton();
    
    const tabGraphic = new Graphics();
    tabGraphic.roundRect(0, 0, 150, 50, 10);
    
    if (isActive) {
      tabGraphic.fill(COLORS.deepMagenta);
      tabGraphic.stroke({ width: 3, color: COLORS.goldAccent });
    } else {
      tabGraphic.fill(COLORS.dustyBlue);
      tabGraphic.stroke({ width: 2, color: COLORS.deepMagenta });
    }
    
    tab.defaultView = tabGraphic;
    
    const chapterNames = ["Bitcoin Genesis", "Ethereum Empire", "Altcoin Arena"];
    
    tab.textView = new Text({
      text: `Ch.${chapter}\n${chapterNames[chapter - 1]}`,
      style: {
        fill: isActive ? COLORS.warmCream : COLORS.warmCream,
        fontSize: 12,
        fontWeight: "bold",
        align: "center",
      },
    });
    
    tab.anchor.set(0.5, 0.5);
    tab.x = 75;
    tab.y = 25;
    
    tab.onPress.connect(() => {
      this.switchChapter(chapter);
    });
    
    return tab;
  }

  private createStagesView() {
    this.stagesContainer = new Container();
    this.addChild(this.stagesContainer);
    this.updateStagesView();
  }

  private updateStagesView() {
    // Clear existing stages
    this.stagesContainer.removeChildren();

    const chapterStages = this.stages.filter(stage => stage.chapter === this.currentChapter);
    const stageWidth = 200;
    const stageHeight = 150;
    const stageSpacing = 20;
    const stagesPerRow = 3;

    chapterStages.forEach((stage, index) => {
      const row = Math.floor(index / stagesPerRow);
      const col = index % stagesPerRow;
      
      const stageCard = this.createStageCard(stage);
      stageCard.x = col * (stageWidth + stageSpacing);
      stageCard.y = row * (stageHeight + stageSpacing);
      
      this.stagesContainer.addChild(stageCard);
    });

    // Center the stages container
    this.stagesContainer.x = (800 - (Math.min(stagesPerRow, chapterStages.length) * (stageWidth + stageSpacing) - stageSpacing)) / 2;
    this.stagesContainer.y = 160;
  }

  private createStageCard(stage: StageData): Container {
    const card = new Container();

    // Stage background
    const cardBg = new Graphics();
    const difficultyColor = this.getDifficultyColor(stage.difficulty);
    
    cardBg.roundRect(0, 0, 200, 150, 10);
    
    if (stage.locked) {
      cardBg.fill(COLORS.shadowGray);
      cardBg.stroke({ width: 2, color: COLORS.shadowGray });
    } else if (stage.completed) {
      cardBg.fill(COLORS.dustyBlue);
      cardBg.stroke({ width: 3, color: COLORS.successGreen });
    } else {
      cardBg.fill(COLORS.dustyBlue);
      cardBg.stroke({ width: 3, color: difficultyColor });
    }
    
    card.addChild(cardBg);

    // Stage thumbnail area
    const thumbnailBg = new Graphics();
    thumbnailBg.roundRect(10, 10, 180, 80, 5);
    thumbnailBg.fill(stage.locked ? COLORS.shadowGray : COLORS.lightBg);
    card.addChild(thumbnailBg);

    // Stage number badge
    const stageBadge = new Graphics();
    stageBadge.circle(25, 25, 12);
    stageBadge.fill(difficultyColor);
    stageBadge.stroke({ width: 2, color: COLORS.warmCream });
    card.addChild(stageBadge);

    const stageNumText = new Text({
      text: stage.stageNumber.toString(),
      style: {
        fill: COLORS.warmCream,
        fontSize: 12,
        fontWeight: "bold",
        align: "center",
      },
    });
    stageNumText.anchor.set(0.5, 0.5);
    stageNumText.x = 25;
    stageNumText.y = 25;
    card.addChild(stageNumText);

    // Completion status
    if (stage.completed) {
      const checkmark = new Text({
        text: "✓",
        style: {
          fill: COLORS.successGreen,
          fontSize: 20,
          fontWeight: "bold",
        },
      });
      checkmark.anchor.set(0.5, 0.5);
      checkmark.x = 170;
      checkmark.y = 30;
      card.addChild(checkmark);
    } else if (stage.locked) {
      const lockIcon = new Text({
        text: "🔒",
        style: {
          fontSize: 16,
        },
      });
      lockIcon.anchor.set(0.5, 0.5);
      lockIcon.x = 170;
      lockIcon.y = 30;
      card.addChild(lockIcon);
    }

    // Stage name
    const nameText = new Text({
      text: stage.name,
      style: {
        fill: stage.locked ? COLORS.shadowGray : COLORS.warmCream,
        fontSize: 14,
        fontWeight: "bold",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    nameText.x = 100;
    nameText.y = 100;
    nameText.anchor.set(0.5, 0);
    card.addChild(nameText);

    // Difficulty indicator
    const diffText = new Text({
      text: stage.difficulty.toUpperCase(),
      style: {
        fill: difficultyColor,
        fontSize: 10,
        fontWeight: "bold",
        align: "center",
      },
    });
    diffText.x = 100;
    diffText.y = 125;
    diffText.anchor.set(0.5, 0);
    card.addChild(diffText);

    // Make interactive if not locked
    if (!stage.locked) {
      card.interactive = true;
      card.cursor = "pointer";
      
      card.on("pointerdown", () => {
        console.log(`Starting stage: ${stage.name}`);
        // TODO: Navigate to battle/stage screen
      });

      // Hover effect
      card.on("pointerover", () => {
        card.scale.set(1.05);
      });
      
      card.on("pointerout", () => {
        card.scale.set(1.0);
      });
    }

    return card;
  }

  private getDifficultyColor(difficulty: string): number {
    switch (difficulty) {
      case "easy": return COLORS.successGreen;
      case "normal": return COLORS.warningAmber;
      case "hard": return COLORS.dangerRed;
      case "expert": return COLORS.deepMagenta;
      default: return COLORS.common;
    }
  }

  private switchChapter(chapter: number) {
    this.currentChapter = chapter;
    this.updateStagesView();
    
    // Update tab appearance
    this.chapterTabs.removeChildren();
    const chapters = [1, 2, 3];
    const tabWidth = 150;
    const tabSpacing = 10;
    
    chapters.forEach((ch, index) => {
      const tab = this.createChapterTab(ch, ch === chapter);
      tab.x = index * (tabWidth + tabSpacing);
      this.chapterTabs.addChild(tab);
    });
  }

  public resize(width: number, height: number) {
    // Resize background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(COLORS.darkBg);

    // Center title
    this.titleText.x = width / 2;

    // Center chapter tabs
    this.chapterTabs.x = (width - 480) / 2; // 3 tabs * 150 + 2 * 10 spacing

    // Center stages
    this.stagesContainer.x = (width - 660) / 2; // Approximate width for 3 stages
  }

  public update(_time: Ticker) {
    // Any animations or updates
  }
}