import { Graphics, Container, Text, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { Hero } from './Hero';
import { Monster } from './Monster';
import { testForAABB, delay } from './util';

export class DuelScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        this.view.isRenderGroup = true;

        this.LINE_Y = this.app.canvas.height /2;
    }

    init() {
        //this.addBackground();
        this.addHero();
        this.addMonster();
    }

    addChild(child) {
        this.view.addChild(child);
    }

    removeChild(child) {
        this.view.removeChild(child);
    }

    async loadAssets() {
        this.skillsSheet = await Assets.load('skills');
        //let skillsAnimations = this.skillsSheet.animations;
        
        // this.skillsSprites = ["str", "crit", "agi", "hp", "def"].reduce((hash, skill) => {
        //     hash[skill] = new AnimatedSprite(skillsAnimations[skill]);
        //     return hash;
        // }, {});
        
        this.heroSheet = await Assets.load('stickman_duel');
        this.heroSprite = new AnimatedSprite(this.heroSheet.animations.idle);
        
        this.monsterSheet = await Assets.load('mew');
        this.monsterSprite = new AnimatedSprite(this.monsterSheet.animations.idle);

    }

    async addHero() {
        this.hero = new Hero(this.app, this);
        this.hero.init();
        this.view.addChild(this.hero.sprite);

        this.hero.sprite.interactive = true;
        this.hero.sprite.cursor = "pointer";
        this.hero.sprite.on("mousedown", this.heroFight.bind(this));
    }

    async addMonster() {
        this.monster = new Monster(this.app, this);
        await this.monster.init();
        this.view.addChild(this.monster.sprite);
    }

    async heroFight() {
        this.hero.sprite.position.x += 60;
        this.hero.sprite.textures = this.heroSheet.animations.fight;
        this.hero.sprite.gotoAndPlay(0);
        await delay(2000);
        this.hero.sprite.textures = this.heroSheet.animations.idle;
        this.hero.sprite.gotoAndPlay(0);
        this.hero.sprite.position.x -= 60;
    }
}
