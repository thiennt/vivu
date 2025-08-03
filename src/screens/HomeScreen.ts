import { Container, Ticker, Sprite, Assets } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';

import { Menu } from '../ui/Menu';
import { BattleScene } from '../ui/BattleScene';


export class HomeScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];

    private background: Sprite;
    
    private menu: Menu;
    
    constructor() {
        super();

        this.background = new Sprite(Assets.get('background'));
        this.addChild(this.background);

        this.menu = new Menu();
        this.addChild(this.menu);
    }

    public prepare() {
        
    }

    public async show() {
        this.menu.show();

    }

    public resize(width: number, height: number) {
        this.background.width = width;
        this.background.height = height;

        this.menu.resize(width, height);
    }

    public update(time: Ticker) {
        
    }
}
