import { Container, Graphics, Text } from 'pixi.js';

export class CharacterScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];

    private background!: Graphics;
    private titleText!: Text;

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
            text: 'CHARACTER SCREEN - WORKING!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fontWeight: 'bold',
                fill: 0xff0000,
                align: 'center'
            }
        });
        this.addChild(this.titleText);
    }

    public prepare() {
        // Nothing special needed for now
    }

    public async show() {
        // Fade in animation could be added here
    }

    public resize(width: number, height: number) {
        // Background
        this.background.clear()
            .rect(0, 0, width, height - 100) // -100 for menu bar
            .fill(0x00ff00); // Bright green to be very visible
        
        // Title positioning
        this.titleText.x = width / 2 - this.titleText.width / 2;
        this.titleText.y = height / 2 - this.titleText.height / 2;
    }
}