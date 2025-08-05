import { Container, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';

import { DuelScene } from '../ui/DuelScene';
import { CombatScene } from '../ui/CombatScene';

export class DungeonScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['game'];
    
    private combatScene: CombatScene;

    constructor() {
        super();

        this.combatScene = new CombatScene();
        this.addChild(this.combatScene);
    }

    public prepare() {
        this.combatScene.prepare();
    }

    public async show() {

        this.combatScene.show();
    }

    public async hide() {
        this.removeChild(this.combatScene);
        this.combatScene.hide();
    }

    public resize(width: number, height: number) {

        this.combatScene.x = 0;
        this.combatScene.y = 0;
        this.combatScene.resize(width, height);
    }

    public update(time: Ticker) {
        //this.combatScene.update(time);
    }
}
