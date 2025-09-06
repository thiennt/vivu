import { Container, Sprite, Assets, Text, Graphics, Ticker } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { COLORS } from "../app";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";
import { HeroCardData } from "./HeroCollectionScreen";

// Formation position interface
interface FormationSlot {
  id: number;
  x: number;
  y: number;
  occupied: boolean;
  character?: HeroCardData;
  slotType: "front" | "middle" | "back";
}

export class FormationScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background!: Graphics;
  private backButton!: FancyButton;
  private titleText!: Text;
  private formationArea!: Container;
  private heroSelectionArea!: Container;
  private formationSlots: FormationSlot[] = [];
  private availableHeroes: HeroCardData[] = [];
  private selectedSlot: FormationSlot | null = null;

  constructor() {
    super();

    this.createBackground();
    this.createHeader();
    this.initFormationData();
    this.createFormationGrid();
    this.createHeroSelection();
    this.createActionButtons();
  }

  private createBackground() {
    this.background = new Graphics();
    this.background.rect(0, 0, 800, 600);
    this.background.fill(COLORS.lightBg);
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
      text: "Battle Formation",
      style: {
        fill: COLORS.deepMagenta,
        fontSize: 28,
        fontWeight: "bold",
        align: "center",
        dropShadow: {
          alpha: 0.7,
          angle: 45,
          blur: 2,
          color: COLORS.shadowGray,
          distance: 2,
        },
      },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = 400;
    this.titleText.y = 20;
    this.addChild(this.titleText);

    // Instructions
    const instructionsText = new Text({
      text: "Drag heroes to formation slots. Front row takes more damage but deals more.",
      style: {
        fill: COLORS.dustyBlue,
        fontSize: 14,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 600,
      },
    });
    instructionsText.anchor.set(0.5, 0);
    instructionsText.x = 400;
    instructionsText.y = 55;
    this.addChild(instructionsText);
  }

  private initFormationData() {
    // Create 3x2 formation grid (3 rows, 2 columns)
    this.formationSlots = [
      // Front row (highest risk, highest damage)
      { id: 1, x: 150, y: 100, occupied: false, slotType: "front" },
      { id: 2, x: 250, y: 100, occupied: false, slotType: "front" },
      
      // Middle row (balanced)
      { id: 3, x: 150, y: 180, occupied: false, slotType: "middle" },
      { id: 4, x: 250, y: 180, occupied: false, slotType: "middle" },
      
      // Back row (lowest risk, support roles)
      { id: 5, x: 150, y: 260, occupied: false, slotType: "back" },
      { id: 6, x: 250, y: 260, occupied: false, slotType: "back" },
    ];

    // Available heroes (mock data)
    this.availableHeroes = [
      {
        id: "btc",
        name: "Bitcoin Knight",
        symbol: "BTC",
        rarity: "legendary",
        avatar: "stickman_1.png",
        color: "#F7931A",
        description: "Tank warrior",
        level: 25,
        owned: true,
      },
      {
        id: "eth",
        name: "Ethereum Mage",
        symbol: "ETH", 
        rarity: "epic",
        avatar: "stickman_2.png",
        color: "#627EEA",
        description: "Magic damage dealer",
        level: 20,
        owned: true,
      },
      {
        id: "sol",
        name: "Solana Speedster",
        symbol: "SOL",
        rarity: "rare",
        avatar: "stickman_3.png",
        color: "#9945FF",
        description: "Fast attacker",
        level: 15,
        owned: true,
      },
      {
        id: "link",
        name: "Chainlink Oracle",
        symbol: "LINK",
        rarity: "epic",
        avatar: "stickman_2.png",
        color: "#375BD2",
        description: "Support healer",
        level: 18,
        owned: true,
      },
    ];
  }

  private createFormationGrid() {
    this.formationArea = new Container();

    // Formation background
    const formationBg = new Graphics();
    formationBg.roundRect(0, 0, 400, 300, 15);
    formationBg.fill(COLORS.dustyBlue);
    formationBg.stroke({ width: 3, color: COLORS.deepMagenta });
    this.formationArea.addChild(formationBg);

    // Row labels
    const rowLabels = ["FRONT", "MIDDLE", "BACK"];
    rowLabels.forEach((label, index) => {
      const labelText = new Text({
        text: label,
        style: {
          fill: COLORS.warmCream,
          fontSize: 12,
          fontWeight: "bold",
          align: "center",
        },
      });
      labelText.anchor.set(0.5, 0.5);
      labelText.x = 50;
      labelText.y = 130 + index * 80;
      this.formationArea.addChild(labelText);
    });

    // Create formation slots
    this.formationSlots.forEach(slot => {
      const slotVisual = this.createFormationSlot(slot);
      this.formationArea.addChild(slotVisual);
    });

    this.formationArea.x = 50;
    this.formationArea.y = 100;
    this.addChild(this.formationArea);
  }

  private createFormationSlot(slot: FormationSlot): Container {
    const slotContainer = new Container();
    slotContainer.x = slot.x;
    slotContainer.y = slot.y;

    // Slot background
    const slotBg = new Graphics();
    slotBg.roundRect(0, 0, 80, 80, 8);
    
    const slotColor = this.getSlotTypeColor(slot.slotType);
    slotBg.fill(COLORS.lightBg);
    slotBg.stroke({ width: 3, color: slotColor });
    slotContainer.addChild(slotBg);

    // Slot type indicator
    const typeIcon = new Text({
      text: this.getSlotTypeIcon(slot.slotType),
      style: {
        fontSize: 24,
        align: "center",
      },
    });
    typeIcon.anchor.set(0.5, 0.5);
    typeIcon.x = 40;
    typeIcon.y = 40;
    slotContainer.addChild(typeIcon);

    // Make slot interactive
    slotContainer.interactive = true;
    slotContainer.cursor = "pointer";
    
    slotContainer.on("pointerdown", () => {
      this.selectSlot(slot);
    });

    return slotContainer;
  }

  private getSlotTypeColor(slotType: string): number {
    switch (slotType) {
      case "front": return COLORS.dangerRed;
      case "middle": return COLORS.warningAmber;
      case "back": return COLORS.successGreen;
      default: return COLORS.common;
    }
  }

  private getSlotTypeIcon(slotType: string): string {
    switch (slotType) {
      case "front": return "⚔️";
      case "middle": return "🛡️";
      case "back": return "🏹";
      default: return "📍";
    }
  }

  private createHeroSelection() {
    this.heroSelectionArea = new Container();

    // Selection area background
    const selectionBg = new Graphics();
    selectionBg.roundRect(0, 0, 280, 400, 15);
    selectionBg.fill(COLORS.dustyBlue);
    selectionBg.stroke({ width: 3, color: COLORS.deepMagenta });
    this.heroSelectionArea.addChild(selectionBg);

    // Selection title
    const selectionTitle = new Text({
      text: "Available Heroes",
      style: {
        fill: COLORS.goldAccent,
        fontSize: 16,
        fontWeight: "bold",
        align: "center",
      },
    });
    selectionTitle.anchor.set(0.5, 0);
    selectionTitle.x = 140;
    selectionTitle.y = 15;
    this.heroSelectionArea.addChild(selectionTitle);

    // Create hero cards
    this.availableHeroes.forEach((hero, index) => {
      const heroCard = this.createHeroCard(hero, index);
      this.heroSelectionArea.addChild(heroCard);
    });

    this.heroSelectionArea.x = 480;
    this.heroSelectionArea.y = 100;
    this.addChild(this.heroSelectionArea);
  }

  private createHeroCard(hero: HeroCardData, index: number): Container {
    const card = new Container();
    card.x = 20;
    card.y = 50 + index * 90;

    // Card background
    const cardBg = new Graphics();
    cardBg.roundRect(0, 0, 240, 80, 8);
    cardBg.fill(COLORS.lightBg);
    cardBg.stroke({ width: 2, color: this.getRarityColor(hero.rarity) });
    card.addChild(cardBg);

    // Hero avatar
    try {
      const avatar = new Sprite(Assets.get(hero.avatar));
      avatar.width = 60;
      avatar.height = 60;
      avatar.x = 10;
      avatar.y = 10;
      card.addChild(avatar);
    } catch (error) {
      // Fallback avatar
      const avatarPlaceholder = new Graphics();
      avatarPlaceholder.circle(40, 40, 25);
      avatarPlaceholder.fill(hero.color);
      avatarPlaceholder.stroke({ width: 2, color: this.getRarityColor(hero.rarity) });
      card.addChild(avatarPlaceholder);
    }

    // Hero info
    const nameText = new Text({
      text: hero.name,
      style: {
        fill: COLORS.warmCream,
        fontSize: 14,
        fontWeight: "bold",
      },
    });
    nameText.x = 80;
    nameText.y = 15;
    card.addChild(nameText);

    const levelText = new Text({
      text: `Level ${hero.level}`,
      style: {
        fill: COLORS.goldAccent,
        fontSize: 12,
      },
    });
    levelText.x = 80;
    levelText.y = 35;
    card.addChild(levelText);

    const descText = new Text({
      text: hero.description,
      style: {
        fill: COLORS.dustyBlue,
        fontSize: 10,
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    descText.x = 80;
    descText.y = 55;
    card.addChild(descText);

    // Make card interactive
    card.interactive = true;
    card.cursor = "pointer";
    
    card.on("pointerdown", () => {
      this.selectHero(hero);
    });

    // Hover effect
    card.on("pointerover", () => {
      card.scale.set(1.05);
    });
    
    card.on("pointerout", () => {
      card.scale.set(1.0);
    });

    return card;
  }

  private getRarityColor(rarity: string): number {
    switch (rarity) {
      case "legendary": return COLORS.legendary;
      case "epic": return COLORS.epic;
      case "rare": return COLORS.rare;
      case "common": return COLORS.common;
      default: return COLORS.common;
    }
  }

  private createActionButtons() {
    // Save Formation button
    const saveButton = new FancyButton();
    
    const saveGraphic = new Graphics();
    saveGraphic.roundRect(0, 0, 150, 50, 10);
    saveGraphic.fill(COLORS.successGreen);
    saveGraphic.stroke({ width: 2, color: COLORS.deepMagenta });
    
    saveButton.defaultView = saveGraphic;
    
    saveButton.textView = new Text({
      text: "Save Formation",
      style: {
        fill: COLORS.warmCream,
        fontSize: 16,
        fontWeight: "bold",
      },
    });
    
    saveButton.anchor.set(0.5, 0.5);
    saveButton.x = 200;
    saveButton.y = 550;
    
    saveButton.onPress.connect(() => {
      this.saveFormation();
    });
    
    this.addChild(saveButton);

    // Clear Formation button
    const clearButton = new FancyButton();
    
    const clearGraphic = new Graphics();
    clearGraphic.roundRect(0, 0, 150, 50, 10);
    clearGraphic.fill(COLORS.warningAmber);
    clearGraphic.stroke({ width: 2, color: COLORS.deepMagenta });
    
    clearButton.defaultView = clearGraphic;
    
    clearButton.textView = new Text({
      text: "Clear All",
      style: {
        fill: COLORS.warmCream,
        fontSize: 16,
        fontWeight: "bold",
      },
    });
    
    clearButton.anchor.set(0.5, 0.5);
    clearButton.x = 400;
    clearButton.y = 550;
    
    clearButton.onPress.connect(() => {
      this.clearFormation();
    });
    
    this.addChild(clearButton);
  }

  private selectSlot(slot: FormationSlot) {
    this.selectedSlot = slot;
    console.log(`Selected formation slot ${slot.id} (${slot.slotType})`);
  }

  private selectHero(hero: HeroCardData) {
    if (this.selectedSlot && !this.selectedSlot.occupied) {
      this.selectedSlot.character = hero;
      this.selectedSlot.occupied = true;
      console.log(`Placed ${hero.name} in ${this.selectedSlot.slotType} row`);
      
      // Update visual representation
      this.updateFormationVisuals();
      this.selectedSlot = null;
    } else {
      console.log(`Selected hero: ${hero.name} (select a slot first)`);
    }
  }

  private updateFormationVisuals() {
    // This would update the visual representation of heroes in formation slots
    // For now, just log the current formation
    const formation = this.formationSlots.filter(slot => slot.occupied);
    console.log("Current formation:", formation.map(slot => 
      `${slot.character?.name} in ${slot.slotType} row`
    ));
  }

  private saveFormation() {
    const occupiedSlots = this.formationSlots.filter(slot => slot.occupied);
    if (occupiedSlots.length === 0) {
      console.log("No heroes in formation!");
      return;
    }
    
    console.log("Formation saved:", occupiedSlots.map(slot => ({
      hero: slot.character?.name,
      position: slot.slotType,
      slot: slot.id
    })));
    
    // TODO: Save to game state/backend
  }

  private clearFormation() {
    this.formationSlots.forEach(slot => {
      slot.occupied = false;
      slot.character = undefined;
    });
    this.updateFormationVisuals();
    console.log("Formation cleared");
  }

  public resize(width: number, height: number) {
    // Resize background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(COLORS.lightBg);

    // Center title
    this.titleText.x = width / 2;

    // Adjust layout for different screen sizes
    if (width < 800) {
      // Stack vertically for smaller screens
      this.formationArea.x = (width - 400) / 2;
      this.heroSelectionArea.x = (width - 280) / 2;
      this.heroSelectionArea.y = 420;
    } else {
      // Side by side for larger screens
      this.formationArea.x = 50;
      this.heroSelectionArea.x = 480;
      this.heroSelectionArea.y = 100;
    }
  }

  public update(_time: Ticker) {
    // Any animations or updates
  }
}