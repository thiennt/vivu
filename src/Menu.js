import { Graphics, Container, Ticker, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { CombatScene } from "./CombatScene";
import { DuelScene } from "./DuelScene";

export class Menu {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        this.view.isRenderGroup = true;
        
        this.gameState = 0;
        this.duelScene = null;
        this.combatScene = null;
    }

    addChild(child) {
        this.view.addChild(child);
    }

    removeChild(child) {
        this.view.removeChild(child);
    }

    init() {
        this.addMenu();
    }

    async loadAssets() {
        this.menuSheet = await Assets.load('menu');
    }

    addMenu() {
        this.LINE_Y = this.app.canvas.height /2;

        let y = this.LINE_Y + 100;
        let x = 50;

        let homeIcon = this.addIcon("home", x, y);
        this.addChild(homeIcon);

        let characterIcon = this.addIcon("character", x + 100, y);
        characterIcon.on("mousedown", this.chooseCharacter.bind(this));
        this.addChild(characterIcon);

        let dungeonIcon = this.addIcon("dungeon", x + 200, y);
        dungeonIcon.on("mousedown", this.chooseDungeon.bind(this));
        this.addChild(dungeonIcon);

        this.menuBar = new Graphics()
            .rect(0, this.app.canvas.height /2, this.app.canvas.width, 50)
            .fill('000000')
            .stroke({ width: 1, color: "333333" });        
        this.addChild(this.menuBar);
    }

    addIcon(name, x, y) {
        let animations = this.menuSheet.animations;
        let icon = new AnimatedSprite(animations[name]);
        icon.anchor = 0.5;
        icon.width = 50;
        icon.height = 50;
        icon.position.set(x, y);
        icon.interactive = true;
        icon.cursor = "pointer";

        return icon;
    }

    refresh() {
        if (this.combatScene) {
            this.app.stage.removeChild(this.combatScene.view);
        }

        if (this.duelScene) {
            this.app.stage.removeChild(this.duelScene.view);
        }

        if (this.ticker != null) {
            this.ticker.destroy();
            this.ticker = null;
        }
    }

    async chooseDungeon() {
        this.refresh();
        
        this.combatScene = new CombatScene(this.app);
        await this.combatScene.loadAssets();
        this.combatScene.init();
        this.app.stage.addChild(this.combatScene.view);
        
        this.ticker = new Ticker();

        let seconds = 0;
        this.ticker.add((ticker) => {
            if (this.combatScene.gameState == 0) {
                this.combatScene.update(this.app);

                seconds += (1 / 60) * ticker.deltaTime + this.combatScene.warrior.stats.agi / 1000;
                if(seconds >= 2){
                    this.combatScene.addBullets();
                    //combatScene.resetBoxes();
                    seconds -= seconds;
                }
            }    
        });

        this.ticker.start();
    }

    async chooseCharacter() {
        this.refresh();
        
        this.duelScene = new DuelScene(this.app);
        await this.duelScene.loadAssets();
        this.duelScene.init();
        this.app.stage.addChild(this.duelScene.view);
    }
}
