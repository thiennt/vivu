import { Container, Graphics, Text, Assets, AnimatedSprite } from 'pixi.js';

export class CharacterScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];

    private background!: Graphics;
    private titleText!: Text;
    private statsContainer!: Container;
    private upgradePointsText!: Text;
    private statsTexts: { [key: string]: Text } = {};
    private upgradeButtons: { [key: string]: Container } = {};
    
    // Character data (this should ideally be shared/persisted)
    private characterData = {
        level: 1,
        upgradePoints: 5,
        stats: {
            hp: 16,
            maxHp: 16,
            atk: 5,
            str: 5, // renamed from def to str as requested
            crit: 20,
            agi: 3
        } as { [key: string]: number }
    };

    constructor() {
        super();
        this.createUI();
    }

    private createUI() {
        // Background
        this.background = new Graphics();
        this.addChild(this.background);

        // Title
        this.titleText = new Text({
            text: 'CHARACTER',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fontWeight: 'bold',
                fill: 0x000000,
                align: 'center'
            }
        });
        this.addChild(this.titleText);

        // Stats container
        this.statsContainer = new Container();
        this.addChild(this.statsContainer);

        // Upgrade points display
        this.upgradePointsText = new Text({
            text: `Upgrade Points: ${this.characterData.upgradePoints}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fontWeight: 'bold',
                fill: 0x0066cc,
                align: 'center'
            }
        });
        this.addChild(this.upgradePointsText);

        this.createStatsDisplay();
    }

    private createStatsDisplay() {
        const stats = ['hp', 'atk', 'str', 'crit', 'agi'];
        const statNames = {
            hp: 'HP',
            atk: 'ATK', 
            str: 'STR',
            crit: 'CRIT',
            agi: 'AGI'
        };

        stats.forEach((stat, index) => {
            const y = index * 80;
            
            // Stat icon
            const icon = this.createStatIcon(stat);
            icon.position.set(50, y + 40);
            this.statsContainer.addChild(icon);
            
            // Stat name and value
            const statText = new Text({
                text: `${statNames[stat as keyof typeof statNames]}: ${this.getStatValue(stat)}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 20,
                    fill: 0x000000
                }
            });
            statText.position.set(100, y + 30);
            this.statsContainer.addChild(statText);
            this.statsTexts[stat] = statText;
            
            // Upgrade button
            const upgradeButton = this.createUpgradeButton(stat);
            upgradeButton.position.set(300, y + 25);
            this.statsContainer.addChild(upgradeButton);
            this.upgradeButtons[stat] = upgradeButton;
        });
    }

    private createStatIcon(statName: string): AnimatedSprite {
        const skillsSheet = Assets.get('stats');
        const animations = skillsSheet?.animations;
        if (!animations || !animations[statName]) {
            // Fallback: return empty animated sprite if animation is not found
            return new AnimatedSprite([]);
        }
        const icon = new AnimatedSprite(animations[statName]);
        icon.anchor.set(0.5);
        icon.width = 32;
        icon.height = 32;
        return icon;
    }

    private createUpgradeButton(stat: string): Container {
        const button = new Container();
        
        // Button background
        const bg = new Graphics()
            .roundRect(0, 0, 60, 30, 5)
            .fill(0x4CAF50)
            .stroke({ width: 2, color: 0x2E7D32 });
        button.addChild(bg);
        
        // Plus text
        const plusText = new Text({
            text: '+',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fontWeight: 'bold',
                fill: 0xffffff,
                align: 'center'
            }
        });
        plusText.anchor.set(0.5);
        plusText.position.set(30, 15);
        button.addChild(plusText);
        
        // Make interactive
        button.interactive = true;
        button.cursor = 'pointer';
        
        // Button states
        button.on('pointerover', () => {
            if (this.characterData.upgradePoints > 0) {
                bg.clear()
                    .roundRect(0, 0, 60, 30, 5)
                    .fill(0x66BB6A)
                    .stroke({ width: 2, color: 0x2E7D32 });
            }
        });
        
        button.on('pointerout', () => {
            const color = this.characterData.upgradePoints > 0 ? 0x4CAF50 : 0x999999;
            bg.clear()
                .roundRect(0, 0, 60, 30, 5)
                .fill(color)
                .stroke({ width: 2, color: 0x2E7D32 });
        });
        
        button.on('pointerdown', () => {
            this.upgradeStat(stat);
        });
        
        return button;
    }

    private getStatValue(stat: string): string {
        const value = this.characterData.stats[stat];
        if (stat === 'hp') {
            return `${value}/${this.characterData.stats.maxHp}`;
        } else if (stat === 'crit') {
            return `${value}%`;
        }
        return value.toString();
    }

    private upgradeStat(stat: string) {
        if (this.characterData.upgradePoints <= 0) return;
        
        // Deduct upgrade point
        this.characterData.upgradePoints--;
        
        // Increase stat
        if (stat === 'hp') {
            this.characterData.stats.maxHp += 2;
            this.characterData.stats.hp += 2;
        } else if (stat === 'crit') {
            this.characterData.stats[stat] += 5;
        } else {
            this.characterData.stats[stat] += 1;
        }
        
        // Update UI
        this.updateStatsDisplay();
        this.updateUpgradeButtons();
        
        // Save to localStorage (simple persistence)
        this.saveCharacterData();
    }

    private updateStatsDisplay() {
        const statNames = {
            hp: 'HP',
            atk: 'ATK',
            str: 'STR', 
            crit: 'CRIT',
            agi: 'AGI'
        };

        Object.keys(this.statsTexts).forEach(stat => {
            const statName = statNames[stat as keyof typeof statNames];
            this.statsTexts[stat].text = `${statName}: ${this.getStatValue(stat)}`;
        });
        
        this.upgradePointsText.text = `Upgrade Points: ${this.characterData.upgradePoints}`;
    }

    private updateUpgradeButtons() {
        Object.values(this.upgradeButtons).forEach(button => {
            const bg = button.children[0] as Graphics;
            const color = this.characterData.upgradePoints > 0 ? 0x4CAF50 : 0x999999;
            bg.clear()
                .roundRect(0, 0, 60, 30, 5)
                .fill(color)
                .stroke({ width: 2, color: 0x2E7D32 });
        });
    }

    private saveCharacterData() {
        localStorage.setItem('vivu_character_data', JSON.stringify(this.characterData));
    }

    private loadCharacterData() {
        const saved = localStorage.getItem('vivu_character_data');
        if (saved) {
            this.characterData = JSON.parse(saved);
        }
    }

    public prepare() {
        this.loadCharacterData();
        this.updateStatsDisplay();
        this.updateUpgradeButtons();
    }

    public async show() {
        // Fade in animation could be added here
    }

    public resize(width: number, height: number) {
        // Background
        this.background.clear()
            .rect(0, 0, width, height - 100) // -100 for menu bar
            .fill(0xf0f0f0);
        
        // Title positioning
        this.titleText.x = width / 2 - this.titleText.width / 2;
        this.titleText.y = 30;
        
        // Upgrade points positioning
        this.upgradePointsText.x = width / 2 - this.upgradePointsText.width / 2;
        this.upgradePointsText.y = 80;
        
        // Stats container positioning
        this.statsContainer.x = width / 2 - 200;
        this.statsContainer.y = 140;
    }

    // Method to get current character data (for other screens to use)
    public getCharacterData() {
        return { ...this.characterData };
    }

    // Method to sync with external character data updates
    public updateCharacterData(newData: any) {
        this.characterData = { ...this.characterData, ...newData };
        this.updateStatsDisplay();
        this.updateUpgradeButtons();
        this.saveCharacterData();
    }
}