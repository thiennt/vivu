import { Graphics, Container, Ticker, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { Hero } from './Hero';
import { Monster } from './Monster';
import { testForAABB, delay } from './util';

export class DuelScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        this.view.isRenderGroup = true;

        this.LINE_Y = this.app.canvas.height /2;

        this.state = 0; // 0: game start, 1: game end
    }

    init() {
        //this.addBackground();
        this.addHero();
        this.addMonster();

        this.startBattle();
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
        
        this.heroSheet = await Assets.load('stickman');
        this.heroSprite = new AnimatedSprite(this.heroSheet.animations.idle);
        
        this.monsterSheet = await Assets.load('demon');
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

        this.monster.sprite.interactive = true;
        this.monster.sprite.cursor = "pointer";
        this.monster.sprite.on("mousedown", this.monsterFight.bind(this));
    }

    async heroFight() {
        let attack = this.hero.fight();
        let delayTime = 1600;

        if (attack.isCrit) {
            this.hero.sprite.textures = this.heroSheet.animations.crit;
        } else {
            this.hero.sprite.textures = this.heroSheet.animations.fight;
            delayTime = 800;
        }

        this.hero.sprite.position.x += 60;
        this.hero.sprite.animationSpeed = 0.1;
        this.hero.sprite.gotoAndPlay(0);
        
        this.calculateMonsterDamage(attack.damage);

        await delay(delayTime);

        this.hero.sprite.textures = this.heroSheet.animations.idle;
        this.hero.sprite.animationSpeed = 0.05;
        this.hero.sprite.gotoAndPlay(0);
        this.hero.sprite.position.x -= 60;
    }

    async monsterFight() {
        let attack = this.monster.fight();
        let delayTime = 1200;

        if (attack.isCrit) {
            this.monster.sprite.textures = this.monsterSheet.animations.crit;
        } else {
            this.monster.sprite.textures = this.monsterSheet.animations.fight;
            delayTime = 600;
        }

        this.monster.sprite.position.x -= 60;
        this.monster.sprite.animationSpeed = 0.1;
        this.monster.sprite.gotoAndPlay(0);

        this.calculateHeroDamage(attack.damage);

        await delay(delayTime);
        this.monster.sprite.textures = this.monsterSheet.animations.idle;
        this.monster.sprite.animationSpeed = 0.05;
        this.monster.sprite.gotoAndPlay(0);
        this.monster.sprite.position.x += 60;
    }

    calculateMonsterDamage(heroDamage) {
        let stats = this.monster.stats;
        let damage = heroDamage - stats.def;
        this.monster.stats.hp -= damage;
        if (this.hero.stats.hp <= 0) this.monster.stats.hp = 0;
        this.monster.updateStats();
    }

    calculateHeroDamage(monsterDamage) {
        let stats = this.hero.stats;
        let damage = monsterDamage - stats.def;
        this.hero.stats.hp -= damage;
        if (this.hero.stats.hp <= 0) this.hero.stats.hp = 0;
        this.hero.updateStats();
    }

    async startBattle() {
        let turn = this.hero.stats.agi >= this.monster.stats.agi ? 0 : 1; // 0: hero turn, 1: monster turn
        
        while (this.state == 0) {
            await delay(1500);

            if (turn == 0) {
                this.heroFight();
                turn = 1;
            } else {
                this.monsterFight();
                turn = 0;
            }

            if (this.hero.stats.hp <= 0 || this.monster.stats.hp <= 0) {
                this.state = 1;
            }
        }
    }
}
