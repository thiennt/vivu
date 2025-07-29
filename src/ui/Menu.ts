import { Container, Assets, AnimatedSprite, Graphics, Sprite, Spritesheet } from 'pixi.js';
import gsap from 'gsap';
import { app } from '../app';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { DungeonScreen } from '../screens/DungeonScreen';
import { CharacterScreen } from '../screens/CharacterScreen';


export class Menu extends Container {
    private menuBar: Graphics;
    private homeIcon: Sprite;
    private dungeonIcon: Sprite;
    private characterIcon: Sprite;

    constructor() {
        super();

        this.menuBar = new Graphics()
        this.addChild(this.menuBar);

        this.homeIcon = this.addIcon("home");
        this.homeIcon.on("mousedown", this.goToHomeScreen.bind(this));
        this.addChild(this.homeIcon);

        this.characterIcon = this.addIcon("character");
        this.characterIcon.on("mousedown", this.goToCharacterScreen.bind(this));
        this.addChild(this.characterIcon);

        this.dungeonIcon = this.addIcon("dungeon");
        this.dungeonIcon.on("mousedown", this.goToDungeonScreen.bind(this));
        this.addChild(this.dungeonIcon);
    }

    private addIcon(name: string) {
        const icon = new Sprite(Assets.get(name));
        icon.anchor = 0.5;
        icon.width = 50;
        icon.height = 50;
        //icon.position.set(x, y);
        icon.interactive = true;
        icon.cursor = "pointer";

        return icon;
    }

    public async show() {
        this.menuBar.clear().rect(0, 0, navigation.width, 100)
            .fill(0x000000)
            .stroke({ width: 1, color: "333333" });

        this.homeIcon.x = 80;
        this.homeIcon.y = 50;
        this.characterIcon.x = 160;
        this.characterIcon.y = 50;
        this.dungeonIcon.x = 240;
        this.dungeonIcon.y = 50;

        let currentScreen = navigation.currentScreen;
        let icon = this.homeIcon;
        if (currentScreen instanceof DungeonScreen) {
            icon = this.dungeonIcon;
        } else if (currentScreen instanceof CharacterScreen) {
            icon = this.characterIcon;
        }
        this.clearHighlights();
        this.highlight(icon);
    }

    public clearHighlights() {
        [this.homeIcon, this.characterIcon, this.dungeonIcon].forEach(icon => {
            icon.tint = 0xffffff;
            icon.scale.set(1);
        });
    }

    public highlight(icon: Sprite) {
        icon.tint = 0xC9B6B0;
        icon.scale.set(1.2);
    }

    public resize(width: number, height: number) {
        this.x = 0;
        this.y = height - 100;
    }

    public goToHomeScreen() {
        navigation.showScreen(HomeScreen);
    }

    public goToCharacterScreen() {
        navigation.showScreen(CharacterScreen);
    }

    public goToDungeonScreen() {
        navigation.showScreen(DungeonScreen);
    }

}
