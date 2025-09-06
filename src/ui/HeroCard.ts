import { Container, Graphics, Text, Sprite, Assets } from "pixi.js";

export interface HeroCardData {
  id: string;
  name: string;
  symbol: string;
  rarity: string;
  avatar: string;
  color: string;
  description: string;
}

export class HeroCard extends Container {
  private cardBg!: Graphics;
  private avatar!: Sprite;
  private nameText!: Text;
  private symbolText!: Text;
  private rarityBadge!: Graphics;
  private rarityText!: Text;
  private cardWidth = 120;
  private cardHeight = 160;

  constructor(private heroData: HeroCardData) {
    super();

    this.createCard();
    this.interactive = true;
    this.cursor = "pointer";

    // Add hover effects
    this.on("pointerenter", this.onHoverStart.bind(this));
    this.on("pointerleave", this.onHoverEnd.bind(this));
  }

  private createCard() {
    // Main card background with soft edges
    this.cardBg = new Graphics();
    this.cardBg
      .roundRect(0, 0, this.cardWidth, this.cardHeight, 12)
      .fill(0xffffff)
      .stroke({ width: 2, color: 0x000000 });

    // Add subtle shadow effect
    const shadow = new Graphics();
    shadow
      .roundRect(2, 2, this.cardWidth, this.cardHeight, 12)
      .fill(0xaaaaaa);
    this.addChild(shadow);
    this.addChild(this.cardBg);

    // Rarity badge
    this.createRarityBadge();

    // Avatar
    this.createAvatar();

    // Name text
    this.nameText = new Text({
      text: this.heroData.name,
      style: {
        fontSize: 14,
        fill: 0xaaaaaa,
        fontWeight: "bold",
        fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
        align: "center",
      },
    });
    this.nameText.anchor.set(0.5);
    this.nameText.position.set(this.cardWidth / 2, this.cardHeight - 35);
    this.addChild(this.nameText);

    // Symbol text
    this.symbolText = new Text({
      text: this.heroData.symbol,
      style: {
        fontSize: 12,
        fill: 0xaaaaaa,
        fontFamily: "'Nunito', 'Baloo 2', sans-serif",
        align: "center",
      },
    });
    this.symbolText.anchor.set(0.5);
    this.symbolText.position.set(this.cardWidth / 2, this.cardHeight - 18);
    this.addChild(this.symbolText);
  }

  private createRarityBadge() {
    // Get rarity color
    const rarityColor = this.getRarityColor();

    this.rarityBadge = new Graphics();
    this.rarityBadge
      .roundRect(8, 8, 35, 16, 8)
      .fill(rarityColor)
      .stroke({ width: 1, color: 0xffffff });
    this.addChild(this.rarityBadge);

    this.rarityText = new Text({
      text: this.heroData.rarity.toUpperCase(),
      style: {
        fontSize: 8,
        fill: 0xffffff,
        fontWeight: "bold",
        fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
      },
    });
    this.rarityText.anchor.set(0.5);
    this.rarityText.position.set(25.5, 16);
    this.addChild(this.rarityText);
  }

  private createAvatar() {
    // Try to load the specified avatar, fallback to default
    let avatarTexture;
    try {
      avatarTexture = Assets.get(this.heroData.avatar);
    } catch {
      // Fallback to a placeholder or default avatar
      avatarTexture = Assets.get("plus");
    }

    this.avatar = new Sprite(avatarTexture);
    this.avatar.anchor.set(0.5);
    this.avatar.position.set(this.cardWidth / 2, 60);

    // Scale to fit nicely in the card
    const maxSize = 50;
    if (this.avatar.width > maxSize || this.avatar.height > maxSize) {
      const scale = maxSize / Math.max(this.avatar.width, this.avatar.height);
      this.avatar.scale.set(scale);
    }

    // Add a colored tint based on the hero's color - convert hex to number
    if (typeof this.heroData.color === "string") {
      // Convert hex string to number if needed
      const colorValue = this.heroData.color.startsWith("#")
        ? parseInt(this.heroData.color.slice(1), 16)
        : parseInt(this.heroData.color, 16);
      this.avatar.tint = colorValue;
    } else {
      this.avatar.tint = this.heroData.color;
    }

    this.addChild(this.avatar);

    // Add a circular background for the avatar
    const avatarBg = new Graphics();
    avatarBg
      .circle(this.cardWidth / 2, 60, 35)
      .fill(this.getAvatarBgColor())
      .stroke({ width: 2, color: 0xffffff });
    this.addChildAt(avatarBg, this.getChildIndex(this.avatar));
  }

  private getRarityColor(): string {
    switch (this.heroData.rarity.toLowerCase()) {
      case "legendary":
        return "0xf0c674"; // Gold
      case "epic":
        return "0xe67e22"; // Orange
      case "rare":
        return "0x3498db"; // Blue
      case "common":
        return "0x7f8c8d"; // Gray
      default:
        return "0x95a5a6"; // Dusty Blue
    }
  }

  private getAvatarBgColor(): string {
    // Use crypto-specific colors or pastel colors based on hero type
    switch (this.heroData.symbol) {
      case "BTC":
        return "0xf0c674"; // Gold
      case "ETH":
        return "0x95a5a6"; // Dusty Blue
      case "SOL":
        return "0x95a5a6"; // Dusty Blue
      default:
        return "0x4caf50"; // Green
    }
  }

  private onHoverStart() {
    // Gentle scale animation on hover
    this.scale.set(1.05);
    this.cardBg.tint = 0xf0f8ff; // Very light blue tint
  }

  private onHoverEnd() {
    // Return to normal
    this.scale.set(1.0);
    this.cardBg.tint = 0xffffff; // Remove tint
  }

  // Method to update card data
  public updateHeroData(newData: HeroCardData) {
    this.heroData = newData;
    this.removeChildren();
    this.createCard();
  }
}
