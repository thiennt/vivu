import { Container, Ticker } from 'pixi.js';

import { Menu } from '../ui/Menu';
import { CombatScene } from '../ui/CombatScene';
import { FarcasterMiniAppUI } from '../ui/FarcasterUI';

export class DungeonScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];
    
    private menu: Menu;
    private combatScene: CombatScene;
    private farcasterUI: FarcasterMiniAppUI;

    constructor() {
        super();

        this.menu = new Menu();
        this.addChild(this.menu);

        this.combatScene = new CombatScene();
        this.addChild(this.combatScene);

        this.farcasterUI = new FarcasterMiniAppUI();
        this.addChild(this.farcasterUI);
    }

    public prepare() {
        this.combatScene.prepare();
    }

    public async show() {
        this.menu.show();

        this.combatScene.show();
        
        // Show Farcaster UI if in frame context or user wants social features
        this.farcasterUI.show();
    }

    public resize(width: number, height: number) {
        this.menu.resize(width, height);

        this.combatScene.x = 0;
        this.combatScene.y = this.menu.y;
        this.combatScene.resize(width, height);
        
        this.farcasterUI.resize(width, height);
    }

    public update(time: Ticker) {
        this.combatScene.update(time);
    }
}
