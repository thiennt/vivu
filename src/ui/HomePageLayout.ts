import { Container, Assets, Sprite, Text, Graphics } from 'pixi.js';
import gsap from 'gsap';

export class HomePageLayout extends Container {
    private background!: Sprite;
    private titleText!: Text;
    private gameCategories!: Container;
    private categoryIcons: Sprite[] = [];

    constructor() {
        super();

        this.createBackground();
        this.createTitle();
        this.createGameCategories();
    }

    private createBackground() {
        this.background = new Sprite(Assets.get('homepage_background'));
        this.addChild(this.background);
    }

    private createTitle() {
        this.titleText = new Text('VIVU GAMES', {
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            stroke: { color: '#000000', width: 3 },
            dropShadow: {
                color: '#000000',
                blur: 4,
                distance: 2,
            }
        });
        this.titleText.anchor.set(0.5);
        this.addChild(this.titleText);
    }

    private createGameCategories() {
        this.gameCategories = new Container();
        this.addChild(this.gameCategories);

        const categories = [
            { name: 'Adventure', icon: 'adventure_icon', description: 'Epic quests await!' },
            { name: 'Puzzle', icon: 'puzzle_icon', description: 'Challenge your mind' },
            { name: 'Racing', icon: 'racing_icon', description: 'Speed and thrills' },
            { name: 'Strategy', icon: 'strategy_icon', description: 'Think and conquer' },
            { name: 'Arcade', icon: 'arcade_icon', description: 'Classic fun' },
            { name: 'Action', icon: 'play_icon', description: 'Fast-paced battles' }
        ];

        categories.forEach((category) => {
            this.createGameCategory(category);
        });
    }

    private createGameCategory(category: { name: string, icon: string, description: string }) {
        const categoryContainer = new Container();
        
        // Background card
        const cardBg = new Graphics();
        cardBg.roundRect(0, 0, 160, 200, 15);
        cardBg.fill(0x000000);
        cardBg.alpha = 0.7;
        cardBg.stroke({ width: 2, color: 0x444444 });
        categoryContainer.addChild(cardBg);

        // Icon
        const icon = new Sprite(Assets.get(category.icon));
        icon.anchor.set(0.5);
        icon.x = 80;
        icon.y = 60;
        icon.width = 64;
        icon.height = 64;
        categoryContainer.addChild(icon);
        this.categoryIcons.push(icon);

        // Title
        const titleText = new Text(category.name, {
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            align: 'center'
        });
        titleText.anchor.set(0.5);
        titleText.x = 80;
        titleText.y = 120;
        categoryContainer.addChild(titleText);

        // Description
        const descText = new Text(category.description, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#CCCCCC',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 140
        });
        descText.anchor.set(0.5);
        descText.x = 80;
        descText.y = 150;
        categoryContainer.addChild(descText);

        // Make interactive
        categoryContainer.interactive = true;
        categoryContainer.cursor = 'pointer';
        
        // Hover effects
        categoryContainer.on('pointerover', () => {
            gsap.to(categoryContainer.scale, { x: 1.05, y: 1.05, duration: 0.2 });
            gsap.to(cardBg, { alpha: 0.9, duration: 0.2 });
        });
        
        categoryContainer.on('pointerout', () => {
            gsap.to(categoryContainer.scale, { x: 1, y: 1, duration: 0.2 });
            gsap.to(cardBg, { alpha: 0.7, duration: 0.2 });
        });

        categoryContainer.on('pointerdown', () => {
            // Handle category selection - for now just log
            console.log(`Selected category: ${category.name}`);
            
            // Add some visual feedback
            gsap.to(categoryContainer.scale, { x: 0.95, y: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
        });

        this.gameCategories.addChild(categoryContainer);
    }

    public show() {
        // Animate categories entrance
        this.gameCategories.children.forEach((category, index) => {
            category.alpha = 0;
            category.y += 50;
            
            gsap.to(category, {
                alpha: 1,
                y: category.y - 50,
                duration: 0.5,
                delay: index * 0.1,
                ease: 'back.out(1.7)'
            });
        });

        // Animate title
        this.titleText.alpha = 0;
        this.titleText.scale.set(0.5);
        gsap.to(this.titleText, {
            alpha: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
        gsap.to(this.titleText.scale, {
            x: 1,
            y: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    }

    public resize(width: number, height: number) {
        // Background
        this.background.width = width;
        this.background.height = height;

        // Title position
        this.titleText.x = width / 2;
        this.titleText.y = 80;

        // Game categories grid layout
        const categoriesPerRow = Math.min(3, Math.floor(width / 180));
        const totalCategories = this.gameCategories.children.length;
        
        const startX = (width - (categoriesPerRow * 180 - 20)) / 2;
        const startY = 150;

        this.gameCategories.children.forEach((category, index) => {
            const row = Math.floor(index / categoriesPerRow);
            const col = index % categoriesPerRow;
            
            category.x = startX + col * 180;
            category.y = startY + row * 220;
        });

        // Center the categories container
        this.gameCategories.x = 0;
        this.gameCategories.y = 0;
    }
}