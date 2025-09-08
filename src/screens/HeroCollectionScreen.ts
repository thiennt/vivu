import { Container, Sprite, Assets, Text, Ticker } from "pixi.js";
import { COLORS } from "../app";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";
import { HeroCard, HeroCardData } from "../ui/HeroCard";

export class HeroCollectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background!: Sprite;
  private backIcon!: Sprite;
  private titleText!: Text;
  private subtitleText!: Text;
  private heroCards: HeroCard[] = [];
  private cardsContainer!: Container;
  private scrollContainer!: Container;

  constructor() {
    super();

    this.initBackground();
    this.initBackButton();
    this.initTitle();
    this.initHeroCards();
  }

  private initBackground() {
    this.background = new Sprite(Assets.get("background_1.png"));
    this.addChild(this.background);
  }

  private initBackButton() {
    this.backIcon = Sprite.from(Assets.get("back"));
    this.backIcon.anchor.set(0.5, 0.5);
    this.backIcon.position.set(50, 50); // Changed from 40,40 to add 10px padding
    this.backIcon.interactive = true;
    this.backIcon.cursor = "pointer";
    this.backIcon.on("click", () => {
      navigation.showScreen(HomeScreen);
    });
    this.addChild(this.backIcon);
  }

  private initTitle() {
    this.titleText = new Text({
      text: "Hero Collection",
      style: {
        fontSize: 32,
        fill: COLORS.warmCream,
        fontWeight: "bold",
        fontFamily: "'Luckiest Guy', 'Fredoka', sans-serif",
        align: "center",
        stroke: { color: COLORS.shadowGray, width: 2 },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(400, 60); // Changed from 50 to 60 to add 10px padding
    this.addChild(this.titleText);

    // Subtitle
    this.subtitleText = new Text({
      text: "Crypto Legends Collection",
      style: {
        fontSize: 16,
        fill: COLORS.warmCream,
        fontFamily: "'Nunito', 'Baloo 2', sans-serif",
        align: "center",
      },
    });
    this.subtitleText.anchor.set(0.5);
    this.subtitleText.position.set(400, 90); // Changed from 80 to 90 to add 10px padding
    this.addChild(this.subtitleText);
  }

  private initHeroCards() {
    this.scrollContainer = new Container();
    this.cardsContainer = new Container();
    this.scrollContainer.addChild(this.cardsContainer);
    this.addChild(this.scrollContainer);

    // Create placeholder crypto hero data
    const heroData: HeroCardData[] = [
      {
        id: "btc",
        name: "Bitcoin",
        symbol: "BTC",
        rarity: "legendary",
        avatar: "stickman_1.png",
        color: "#F7931A", // Use string format for consistency
        description: "The original cryptocurrency hero",
      },
      {
        id: "eth",
        name: "Ethereum",
        symbol: "ETH",
        rarity: "epic",
        avatar: "stickman_2.png",
        color: "#627EEA",
        description: "Smart contract champion",
      },
      {
        id: "sol",
        name: "Solana",
        symbol: "SOL",
        rarity: "rare",
        avatar: "stickman_3.png",
        color: "#9945FF",
        description: "High-speed blockchain warrior",
      },
      {
        id: "ada",
        name: "Cardano",
        symbol: "ADA",
        rarity: "rare",
        avatar: "stickman_4.png",
        color: "#D1ECF1",
        description: "Scientific blockchain scholar",
      },
      {
        id: "dot",
        name: "Polkadot",
        symbol: "DOT",
        rarity: "rare",
        avatar: "stickman_5.png",
        color: "#F8D7DA",
        description: "Multi-chain connector",
      },
      {
        id: "matic",
        name: "Polygon",
        symbol: "MATIC",
        rarity: "common",
        avatar: "stickman_6.png",
        color: "#E2E3F1",
        description: "Layer 2 scaling hero",
      },
    ];

    this.createHeroCards(heroData);
  }

  private createHeroCards(heroDataArray: HeroCardData[]) {
    const cardSpacing = 140;
    const cardsPerRow = 4;
    let currentRow = 0;
    let currentCol = 0;

    heroDataArray.forEach((heroData) => {
      const heroCard = new HeroCard(heroData);

      // Calculate position with 10px padding
      const x = currentCol * cardSpacing + 70; // Changed from 60 to 70 to add 10px padding
      const y = currentRow * 180 + 130; // Changed from 120 to 130 to add 10px padding

      heroCard.position.set(x, y);

      // Add click handler for card selection
      heroCard.on("click", () => this.onHeroCardClick(heroData));

      this.cardsContainer.addChild(heroCard);
      this.heroCards.push(heroCard);

      currentCol++;
      if (currentCol >= cardsPerRow) {
        currentCol = 0;
        currentRow++;
      }
    });
  }

  private onHeroCardClick(heroData: HeroCardData) {
    // For now, just log the selection
    console.log(`Selected hero: ${heroData.name} (${heroData.symbol})`);

    // You could navigate to a hero detail screen or show a modal here
    // navigation.showScreen(HeroDetailScreen, { heroData });

    // For demonstration, create a simple feedback
    this.showSelectionFeedback(heroData);
  }

  private showSelectionFeedback(heroData: HeroCardData) {
    const feedbackText = new Text({
      text: `Selected: ${heroData.name}!`,
      style: {
        fontSize: 20,
        fill: COLORS.warmCream,
        fontWeight: "bold",
        fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
        stroke: { color: COLORS.shadowGray, width: 2 },
      },
    });
    feedbackText.anchor.set(0.5);
    feedbackText.position.set(400, 300);
    feedbackText.alpha = 0;

    this.addChild(feedbackText);

    // Simple fade in/out animation
    let alpha = 0;
    const fadeIn = () => {
      alpha += 0.05;
      feedbackText.alpha = alpha;
      if (alpha < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        setTimeout(fadeOut, 1000);
      }
    };

    const fadeOut = () => {
      alpha -= 0.05;
      feedbackText.alpha = alpha;
      if (alpha > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        this.removeChild(feedbackText);
      }
    };

    fadeIn();
  }

  public prepare() {
    // Any preparation needed before showing the screen
  }

  public async show() {
    // Show animation or effects when screen appears
  }

  public resize(width: number, height: number) {
    this.background.width = width;
    this.background.height = height;

    // Adjust title position with 10px padding
    this.titleText.position.set(width / 2, 60);
    this.subtitleText.position.set(width / 2, 90);

    // Center the cards container with 10px padding
    const cardAreaWidth = 4 * 140; // 4 cards per row * 140 spacing
    const paddedX = Math.max(10, (width - cardAreaWidth) / 2); // Ensure minimum 10px padding
    this.scrollContainer.position.set(paddedX, 0);
  }

  public update(_time: Ticker) {
    // Update animations or dynamic content if needed
  }

  public async hide() {
    // Hide animation or cleanup when screen is hidden
  }
}
