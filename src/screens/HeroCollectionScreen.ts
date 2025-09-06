import { Container, Sprite, Assets, Text, Graphics, Ticker } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { COLORS } from "../app";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";

// Interface for hero card data
export interface HeroCardData {
  id: string;
  name: string;
  symbol: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  avatar: string;
  color: string;
  description: string;
  level?: number;
  owned?: boolean;
}

export class HeroCollectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background!: Graphics;
  private backButton!: FancyButton;
  private titleText!: Text;
  private scrollContainer!: Container;
  private cardsContainer!: Container;
  private heroCards: HeroCardData[] = [];

  constructor() {
    super();

    this.createBackground();
    this.createHeader();
    this.initHeroCards();
    this.createCardGrid();
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
      text: "Crypto Heroes Collection",
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
  }

  private initHeroCards() {
    // Create crypto-themed hero data
    this.heroCards = [
      {
        id: "btc",
        name: "Bitcoin Knight",
        symbol: "BTC",
        rarity: "legendary",
        avatar: "stickman_1.png",
        color: "#F7931A",
        description: "The original cryptocurrency hero, wielding the power of decentralization",
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
        description: "Master of smart contracts and magical applications",
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
        description: "Lightning-fast blockchain warrior with incredible speed",
        level: 15,
        owned: true,
      },
      {
        id: "ada",
        name: "Cardano Scholar",
        symbol: "ADA",
        rarity: "rare",
        avatar: "stickman_4.png",
        color: "#0033AD",
        description: "Scientific blockchain researcher with peer-reviewed powers",
        level: 12,
        owned: false,
      },
      {
        id: "dot",
        name: "Polkadot Connector",
        symbol: "DOT",
        rarity: "rare",
        avatar: "stickman_5.png",
        color: "#E6007A",
        description: "Multi-chain bridge master connecting all realms",
        level: 10,
        owned: false,
      },
      {
        id: "matic",
        name: "Polygon Guardian",
        symbol: "MATIC",
        rarity: "common",
        avatar: "stickman_6.png",
        color: "#8247E5",
        description: "Scaling solutions defender with layer-2 magic",
        level: 8,
        owned: false,
      },
      {
        id: "avax",
        name: "Avalanche Warrior",
        symbol: "AVAX",
        rarity: "rare",
        avatar: "stickman_1.png",
        color: "#E84142",
        description: "Frost-powered DeFi champion from the mountain peaks",
        level: 14,
        owned: false,
      },
      {
        id: "link",
        name: "Chainlink Oracle",
        symbol: "LINK",
        rarity: "epic",
        avatar: "stickman_2.png",
        color: "#375BD2",
        description: "Mystical oracle providing real-world data to the blockchain",
        level: 18,
        owned: true,
      },
    ];
  }

  private createCardGrid() {
    this.scrollContainer = new Container();
    this.cardsContainer = new Container();
    this.scrollContainer.addChild(this.cardsContainer);
    this.addChild(this.scrollContainer);

    const cardsPerRow = 3;
    const cardWidth = 200;
    const cardHeight = 280;
    const cardSpacing = 20;

    this.heroCards.forEach((heroData, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const card = this.createHeroCard(heroData);
      card.x = col * (cardWidth + cardSpacing);
      card.y = row * (cardHeight + cardSpacing);
      
      this.cardsContainer.addChild(card);
    });
  }

  private createHeroCard(heroData: HeroCardData): Container {
    const card = new Container();

    // Card background with rarity-based styling
    const cardBg = new Graphics();
    const rarityColor = this.getRarityColor(heroData.rarity);
    
    cardBg.roundRect(0, 0, 200, 280, 12);
    cardBg.fill(COLORS.dustyBlue);
    cardBg.stroke({ width: 4, color: rarityColor });
    card.addChild(cardBg);

    // Rarity gem/badge
    const rarityBadge = new Graphics();
    rarityBadge.star(20, 20, 5, 12, 8);
    rarityBadge.fill(rarityColor);
    card.addChild(rarityBadge);

    // Avatar area
    const avatarBg = new Graphics();
    avatarBg.roundRect(20, 40, 160, 120, 8);
    avatarBg.fill(COLORS.warmCream);
    avatarBg.stroke({ width: 2, color: rarityColor });
    card.addChild(avatarBg);

    // Avatar placeholder (since we might not have the actual assets)
    try {
      const avatar = new Sprite(Assets.get(heroData.avatar));
      avatar.width = 80;
      avatar.height = 80;
      avatar.x = 60;
      avatar.y = 60;
      card.addChild(avatar);
    } catch (error) {
      // Fallback avatar
      const avatarPlaceholder = new Graphics();
      avatarPlaceholder.circle(100, 100, 35);
      avatarPlaceholder.fill(heroData.color);
      avatarPlaceholder.stroke({ width: 2, color: rarityColor });
      card.addChild(avatarPlaceholder);
    }

    // Character name
    const nameText = new Text({
      text: heroData.name,
      style: {
        fill: COLORS.warmCream,
        fontSize: 16,
        fontWeight: "bold",
        align: "center",
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    nameText.x = 100;
    nameText.y = 170;
    nameText.anchor.set(0.5, 0);
    card.addChild(nameText);

    // Symbol and rarity
    const symbolText = new Text({
      text: `${heroData.symbol} • ${heroData.rarity.toUpperCase()}`,
      style: {
        fill: rarityColor,
        fontSize: 12,
        fontWeight: "bold",
        align: "center",
      },
    });
    symbolText.x = 100;
    symbolText.y = 195;
    symbolText.anchor.set(0.5, 0);
    card.addChild(symbolText);

    // Level (if owned)
    if (heroData.owned && heroData.level) {
      const levelText = new Text({
        text: `Level ${heroData.level}`,
        style: {
          fill: COLORS.goldAccent,
          fontSize: 12,
          fontWeight: "bold",
          align: "center",
        },
      });
      levelText.x = 100;
      levelText.y = 215;
      levelText.anchor.set(0.5, 0);
      card.addChild(levelText);
    } else {
      const lockedText = new Text({
        text: "🔒 Locked",
        style: {
          fill: COLORS.shadowGray,
          fontSize: 12,
          fontStyle: "italic",
          align: "center",
        },
      });
      lockedText.x = 100;
      lockedText.y = 215;
      lockedText.anchor.set(0.5, 0);
      card.addChild(lockedText);
    }

    // Description (truncated)
    const description = heroData.description.length > 40 
      ? heroData.description.substring(0, 37) + "..."
      : heroData.description;
    
    const descText = new Text({
      text: description,
      style: {
        fill: COLORS.warmCream,
        fontSize: 10,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    descText.x = 100;
    descText.y = 235;
    descText.anchor.set(0.5, 0);
    card.addChild(descText);

    // Make card interactive
    card.interactive = true;
    card.cursor = "pointer";
    
    card.on("pointerdown", () => {
      console.log(`Selected hero: ${heroData.name}`);
      // TODO: Navigate to character detail screen
    });

    // Add hover effect
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

  public resize(width: number, height: number) {
    // Resize background
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill(COLORS.lightBg);

    // Center title
    this.titleText.x = width / 2;

    // Position scroll container
    this.scrollContainer.x = Math.max(20, (width - 660) / 2); // Center the 3-column grid
    this.scrollContainer.y = 80;
  }

  public update(_time: Ticker) {
    // Any animations or updates
  }
}