import { Container, Sprite, Assets, Text, Ticker } from 'pixi.js';
import { COLORS } from '../app';
import { navigation } from '../utils/navigation';
import { HomeScreen } from './HomeScreen';
import { HeroCard, HeroCardData } from '../ui/HeroCard';

export class HeroCollectionScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];

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
        // this.initHeroCards(); // Temporarily commented out for testing
    }

    private initBackground() {
        this.background = new Sprite(Assets.get('background_1.png'));
        this.addChild(this.background);
    }

    private initBackButton() {
        this.backIcon = Sprite.from(Assets.get('back'));
        this.backIcon.anchor.set(0.5, 0.5);
        this.backIcon.position.set(40, 40);
        this.backIcon.interactive = true;
        this.backIcon.cursor = 'pointer';
        this.backIcon.on('click', () => {
            navigation.showScreen(HomeScreen);
        });
        this.addChild(this.backIcon);
    }

    private initTitle() {
        this.titleText = new Text({
            text: 'Hero Collection',
            style: {
                fontSize: 32,
                fill: COLORS.white,
                fontWeight: 'bold',
                align: 'center',
                stroke: { color: COLORS.blueDark, width: 2 }
            }
        });
        this.titleText.anchor.set(0.5);
        this.titleText.position.set(400, 50); // Will be adjusted in resize
        this.addChild(this.titleText);

        // Subtitle
        this.subtitleText = new Text({
            text: 'Crypto Legends Collection',
            style: {
                fontSize: 16,
                fill: COLORS.ivory,
                align: 'center'
            }
        });
        this.subtitleText.anchor.set(0.5);
        this.subtitleText.position.set(400, 80); // Will be adjusted in resize
        this.addChild(this.subtitleText);

        // Debug text to show the screen loaded
        const debugText = new Text({
            text: 'Collection Screen Loaded Successfully!',
            style: {
                fontSize: 20,
                fill: COLORS.gold,
                align: 'center'
            }
        });
        debugText.anchor.set(0.5);
        debugText.position.set(400, 200);
        this.addChild(debugText);
    }

    private initHeroCards() {
        this.scrollContainer = new Container();
        this.cardsContainer = new Container();
        this.scrollContainer.addChild(this.cardsContainer);
        this.addChild(this.scrollContainer);

        // Create placeholder crypto hero data
        const heroData: HeroCardData[] = [
            {
                id: 'btc',
                name: 'Bitcoin',
                symbol: 'BTC',
                rarity: 'legendary',
                avatar: 'stickman_1.png',
                color: COLORS.bitcoinOrange,
                description: 'The original cryptocurrency hero'
            },
            {
                id: 'eth',
                name: 'Ethereum',
                symbol: 'ETH',
                rarity: 'epic',
                avatar: 'stickman_2.png',
                color: COLORS.ethereumBlue,
                description: 'Smart contract champion'
            },
            {
                id: 'sol',
                name: 'Solana',
                symbol: 'SOL',
                rarity: 'rare',
                avatar: 'stickman_3.png',
                color: COLORS.solanaGreen,
                description: 'High-speed blockchain warrior'
            },
            {
                id: 'ada',
                name: 'Cardano',
                symbol: 'ADA',
                rarity: 'rare',
                avatar: 'stickman_4.png',
                color: COLORS.pastelBlue,
                description: 'Scientific blockchain scholar'
            },
            {
                id: 'dot',
                name: 'Polkadot',
                symbol: 'DOT',
                rarity: 'rare',
                avatar: 'stickman_5.png',
                color: COLORS.pastelPink,
                description: 'Multi-chain connector'
            },
            {
                id: 'matic',
                name: 'Polygon',
                symbol: 'MATIC',
                rarity: 'common',
                avatar: 'stickman_6.png',
                color: COLORS.pastelPurple,
                description: 'Layer 2 scaling hero'
            }
        ];

        this.createHeroCards(heroData);
    }

    private createHeroCards(heroDataArray: HeroCardData[]) {
        const cardSpacing = 140;
        const cardsPerRow = 4;
        let currentRow = 0;
        let currentCol = 0;

        heroDataArray.forEach((heroData, index) => {
            const heroCard = new HeroCard(heroData);
            
            // Calculate position
            const x = currentCol * cardSpacing + 60;
            const y = currentRow * 180 + 120;
            
            heroCard.position.set(x, y);
            
            // Add click handler for card selection
            heroCard.on('click', () => this.onHeroCardClick(heroData));
            
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
                fill: COLORS.white,
                fontWeight: 'bold',
                stroke: { color: COLORS.blueDark, width: 2 }
            }
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

        // Adjust title position
        this.titleText.position.set(width / 2, 50);
        this.subtitleText.position.set(width / 2, 80);
        
        // Center the cards container
        const cardAreaWidth = 4 * 140; // 4 cards per row * 140 spacing
        this.scrollContainer.position.set((width - cardAreaWidth) / 2, 0);
    }

    public update(time: Ticker) {
        // Update animations or dynamic content if needed
    }

    public async hide() {
        // Hide animation or cleanup when screen is hidden
    }
}