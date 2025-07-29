import { Container, Ticker } from 'pixi.js';

import { Menu } from '../ui/Menu';
import { HomePageLayout } from '../ui/HomePageLayout';


export class HomeScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];

    private menu: Menu;
    private homePage: HomePageLayout;
    
    constructor() {
        super();

        this.homePage = new HomePageLayout();
        this.addChild(this.homePage);

        this.menu = new Menu();
        this.addChild(this.menu);
    }

    public prepare() {
        // No preparation needed for homepage
    }

    public async show() {
        this.homePage.show();
        this.menu.show();
    }

    public resize(width: number, height: number) {
        this.homePage.resize(width, height - 100); // Leave space for menu
        
        this.menu.resize(width, height);
    }

    public update(_time: Ticker) {
        // No updates needed for static homepage
    }
}
