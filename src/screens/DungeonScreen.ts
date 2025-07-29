import { Container, Ticker } from 'pixi.js';
import { Menu } from '../ui/Menu';
import { BattleScene } from '../ui/BattleScene';

export class DungeonScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];
    
    private menu: Menu;
    private battleScene: BattleScene;

    constructor() {
        super();

        this.battleScene = new BattleScene();
        this.addChild(this.battleScene);

        this.menu = new Menu();
        this.addChild(this.menu);
    }

    public prepare() {
        this.battleScene.prepare();
    }

    public async show() {
        this.battleScene.show();
        this.menu.show();
    }

    public resize(width: number, height: number) {
        this.battleScene.x = 0;
        this.battleScene.y = 0;
        this.battleScene.resize(width, height - 100); // Leave space for menu
        
        this.menu.resize(width, height);
    }

    public update(time: Ticker) {
        this.battleScene.update(time);
    }
}
