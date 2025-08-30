import { FancyButton } from '@pixi/ui';
import { Container, Assets, Text, Graphics, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { COLORS } from '../app';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { DungeonScreen } from '../screens/DungeonScreen';
import { CharacterScreen } from '../screens/CharacterScreen';
import { BlocklastScreen } from '../screens/BlocklastScreen';


export class Menu extends Container {
    private heroButton: FancyButton;
    private dungeonButton: FancyButton;
    private inventoryButton: FancyButton;
    private blocklastButton: FancyButton;
    
    constructor() {
        super();

        this.heroButton = this.createMenuButton("Hero", Assets.get('hero'));
        this.heroButton.on('click', () => {
            this.goToHeroScreen();
        });
        this.addChild(this.heroButton);

        this.inventoryButton = this.createMenuButton("Inventory", Assets.get('inventory'));
        this.inventoryButton.on('click', () => {
            //this.goToInventoryScreen();
        });
        this.addChild(this.inventoryButton);

        this.dungeonButton = this.createMenuButton("Dungeon", Assets.get('dungeon'));
        this.dungeonButton.on('click', () => {
            this.goToDungeonScreen();
        });
        this.addChild(this.dungeonButton);

        this.blocklastButton = this.createMenuButton("Blocklast", Assets.get('hero')); // Using hero icon for now
        this.blocklastButton.on('click', () => {
            this.goToBlocklastScreen();
        });
        this.addChild(this.blocklastButton);
    }


    public createMenuButton(text: string, iconTexture: Texture) {
        const button = new FancyButton();

        const graphic = new Graphics();
        graphic.rect(0, 0, 200, 50);
        graphic.fill(COLORS.blue);
        
        button.defaultView = graphic;

        button.iconView = iconTexture;
        button.defaultIconScale = 1;
        button.defaultIconAnchor = {
            x: 0.5,
            y: 0.5,
        };
        button.iconOffset = { x: -60, y: 0 };

        button.textView = new Text({
            text,
            style: {
                fill: COLORS.white,
                fontSize: 24,
                fontWeight: 'bold',
            },
        });
        button.defaultTextScale = 1;
        button.defaultTextAnchor = {
            x: 0.5,
            y: 0.5,
        };
        button.textOffset = { x: 20, y: 0 };

        button.padding = 10;

        button.anchor.set(0.5, 0.5);

        return button
    }

    public show() {}

    public resize(width: number, height: number) {
        this.x = 0;

        const buttonWidth = 200;
        const buttonHeight = 50;
        const spacing = 20;
        
        this.heroButton.width = buttonWidth;
        this.heroButton.height = buttonHeight;
        this.inventoryButton.width = buttonWidth;
        this.inventoryButton.height = buttonHeight;
        this.dungeonButton.width = buttonWidth;
        this.dungeonButton.height = buttonHeight;
        this.blocklastButton.width = buttonWidth;
        this.blocklastButton.height = buttonHeight;

        this.heroButton.x = width / 2;
        this.heroButton.y = 0;
        this.inventoryButton.x = width / 2;
        this.inventoryButton.y = 100;
        
        this.dungeonButton.x = width / 2;
        this.dungeonButton.y = 200;

        this.blocklastButton.x = width / 2;
        this.blocklastButton.y = 300;

        this.y = (height - (this.heroButton.height * 4 + spacing * 3)) / 2;
    }

    public goToHeroScreen() {
        navigation.showScreen(CharacterScreen);
    }

    public goToDungeonScreen() {
        navigation.showScreen(DungeonScreen);
    }

    public goToBlocklastScreen() {
        navigation.showScreen(BlocklastScreen);
    }

}
