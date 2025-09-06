import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { COLORS } from '../app';

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
        this.cursor = 'pointer';
        
        // Add hover effects
        this.on('pointerenter', this.onHoverStart.bind(this));
        this.on('pointerleave', this.onHoverEnd.bind(this));
    }

    private createCard() {
        // Main card background with soft edges
        this.cardBg = new Graphics();
        this.cardBg.roundRect(0, 0, this.cardWidth, this.cardHeight, 12)
            .fill(COLORS.cardBg)
            .stroke({ width: 2, color: COLORS.cardBorder });
        
        // Add subtle shadow effect
        const shadow = new Graphics();
        shadow.roundRect(2, 2, this.cardWidth, this.cardHeight, 12)
            .fill(COLORS.cardShadow);
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
                fill: COLORS.grayDark,
                fontWeight: 'bold',
                align: 'center'
            }
        });
        this.nameText.anchor.set(0.5);
        this.nameText.position.set(this.cardWidth / 2, this.cardHeight - 35);
        this.addChild(this.nameText);

        // Symbol text
        this.symbolText = new Text({
            text: this.heroData.symbol,
            style: {
                fontSize: 12,
                fill: COLORS.gray,
                align: 'center'
            }
        });
        this.symbolText.anchor.set(0.5);
        this.symbolText.position.set(this.cardWidth / 2, this.cardHeight - 18);
        this.addChild(this.symbolText);
    }

    private createRarityBadge() {
        // Get rarity color
        const rarityColor = this.getRarityColor();
        
        this.rarityBadge = new Graphics();
        this.rarityBadge.roundRect(8, 8, 35, 16, 8)
            .fill(rarityColor)
            .stroke({ width: 1, color: COLORS.white });
        this.addChild(this.rarityBadge);

        this.rarityText = new Text({
            text: this.heroData.rarity.toUpperCase(),
            style: {
                fontSize: 8,
                fill: COLORS.white,
                fontWeight: 'bold'
            }
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
            avatarTexture = Assets.get('plus');
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
        if (typeof this.heroData.color === 'string') {
            // Convert hex string to number if needed
            const colorValue = this.heroData.color.startsWith('#') 
                ? parseInt(this.heroData.color.slice(1), 16) 
                : parseInt(this.heroData.color, 16);
            this.avatar.tint = colorValue;
        } else {
            this.avatar.tint = this.heroData.color;
        }
        
        this.addChild(this.avatar);

        // Add a circular background for the avatar
        const avatarBg = new Graphics();
        avatarBg.circle(this.cardWidth / 2, 60, 35)
            .fill(this.getAvatarBgColor())
            .stroke({ width: 2, color: COLORS.white });
        this.addChildAt(avatarBg, this.getChildIndex(this.avatar));
    }

    private getRarityColor(): string {
        switch (this.heroData.rarity.toLowerCase()) {
            case 'legendary': return COLORS.gold;
            case 'epic': return COLORS.redLight;
            case 'rare': return COLORS.blueLight;
            case 'common': return COLORS.gray;
            default: return COLORS.pastelBlue;
        }
    }

    private getAvatarBgColor(): string {
        // Use crypto-specific colors or pastel colors based on hero type
        switch (this.heroData.symbol) {
            case 'BTC': return COLORS.pastelOrange;
            case 'ETH': return COLORS.pastelBlue;
            case 'SOL': return COLORS.pastelPurple;
            default: return COLORS.pastelGreen;
        }
    }

    private onHoverStart() {
        // Gentle scale animation on hover
        this.scale.set(1.05);
        this.cardBg.tint = 0xF0F8FF; // Very light blue tint
    }

    private onHoverEnd() {
        // Return to normal
        this.scale.set(1.0);
        this.cardBg.tint = 0xFFFFFF; // Remove tint
    }

    // Method to update card data
    public updateHeroData(newData: HeroCardData) {
        this.heroData = newData;
        this.removeChildren();
        this.createCard();
    }
}