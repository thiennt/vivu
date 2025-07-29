import { Container, Assets, Graphics, Sprite } from 'pixi.js';
import { navigation } from '../utils/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { DungeonScreen } from '../screens/DungeonScreen';


export class Menu extends Container {
    private menuBar: Graphics;
    private homeIcon: Sprite;
    private dungeonIcon: Sprite;
    private gamesIcon: Sprite;

    constructor() {
        super();

        this.menuBar = new Graphics()
        this.addChild(this.menuBar);

        this.homeIcon = this.addIcon("home");
        this.homeIcon.on("pointerdown", this.goToHomeScreen.bind(this));
        this.addChild(this.homeIcon);

        this.gamesIcon = this.addIcon("games");
        this.gamesIcon.on("pointerdown", this.goToDungeonScreen.bind(this));
        this.addChild(this.gamesIcon);

        this.dungeonIcon = this.addIcon("dungeon");
        this.dungeonIcon.on("pointerdown", this.goToDungeonScreen.bind(this));
        this.addChild(this.dungeonIcon);
    }

    private addIcon(name: string) {
        const icon = new Sprite(Assets.get(name));
        icon.anchor = 0.5;
        icon.width = 50;
        icon.height = 50;
        icon.interactive = true;
        icon.cursor = "pointer";

        // Add hover effects
        icon.on('pointerover', () => {
            icon.tint = 0xC9B6B0;
            icon.scale.set(1.1);
        });
        
        icon.on('pointerout', () => {
            // Only reset if not highlighted
            if (icon.tint !== 0xC9B6B0 || icon.scale.x !== 1.2) {
                icon.tint = 0xFFFFFF;
                icon.scale.set(1.0);
            }
        });

        return icon;
    }

    public async show() {
        this.menuBar.clear().rect(0, 0, navigation.width, 100)
            .fill(0x1a1a2e)
            .stroke({ width: 2, color: 0x16213e });

        // Position icons with better spacing
        const iconSpacing = 80;
        const startX = 80;
        
        this.homeIcon.x = startX;
        this.homeIcon.y = 50;
        
        this.gamesIcon.x = startX + iconSpacing;
        this.gamesIcon.y = 50;
        
        this.dungeonIcon.x = startX + iconSpacing * 2;
        this.dungeonIcon.y = 50;

        let currentScreen = navigation.currentScreen;
        let icon = this.homeIcon;
        if (currentScreen instanceof DungeonScreen) {
            icon = this.dungeonIcon;
        }
        this.highlight(icon);
    }

    public highlight(icon: Sprite) {
        // Reset all icons first
        [this.homeIcon, this.gamesIcon, this.dungeonIcon].forEach(i => {
            i.tint = 0xFFFFFF;
            i.scale.set(1.0);
        });
        
        // Highlight the selected icon
        icon.tint = 0xC9B6B0;
        icon.scale.set(1.2);
    }

    public resize(width: number, height: number) {
        this.x = 0;
        this.y = height - 100;
        
        // Update menu bar width
        this.menuBar.clear().rect(0, 0, width, 100)
            .fill(0x1a1a2e)
            .stroke({ width: 2, color: 0x16213e });
    }

    public goToHomeScreen() {
        this.highlight(this.homeIcon);
        navigation.showScreen(HomeScreen);
    }

    public goToDungeonScreen() {
        this.highlight(this.dungeonIcon);
        navigation.showScreen(DungeonScreen);
    }

}
