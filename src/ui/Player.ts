import { Container, Assets, AnimatedSprite } from 'pixi.js';
import { getRandomItemByRate, AnimationSet } from '../utils/common';

import { Stats } from '../utils/common';

export class Player extends Container {
    public character: AnimatedSprite;
    public fightAnimation: AnimatedSprite;
    public critAnimation: AnimatedSprite;
    public animations: AnimationSet = {
        idle: [],
        run: [],
        fight: [],
        crit: []
    };
    public stats: Stats = {
        "hp": 16,
        "maxHp": 16,
        "atk": 5,
        "def": 5,
        "crit": 20,
        "agi": 3
    }

    public supportStats: Stats = {
        "hp": 0,
        "maxHp": 0,
        "atk": 0,
        "def": 0,
        "crit": 0,
        "agi": 0
    }
    public baseHitRate = 65;
    public baseSPA = 1.5; // seconds per action

    constructor() {
        super();

        this.initAnimations();

        this.character = new AnimatedSprite(this.animations.idle ?? []);
        this.character.anchor = 0.5;
        this.character.scale.set(1);
        // this.sprite.width = 40;
        // this.sprite.height = 80;
        this.character.animationSpeed = 0.05;
        this.character.loop = true;
        this.character.play();
        //this.character.position.set(this.app.canvas.width / 2 - 50, this.scene.LINE_Y - 42);
       
        this.addChild(this.character);

        this.fightAnimation = new AnimatedSprite(this.animations.fight ?? []);
        this.fightAnimation.anchor = 0.5;
        this.fightAnimation.scale.set(1);
        this.fightAnimation.loop = false;

        this.critAnimation = new AnimatedSprite(this.animations.crit ?? []);
        this.critAnimation.anchor = 0.5;
        this.critAnimation.scale.set(1);
        this.critAnimation.loop = false;

    }

    public initAnimations() {
        const textures = Assets.get('hero').textures;

        this.animations.idle = [textures.stickman_1, textures.stickman_2];
        this.animations.run = [textures.stickman_1, textures.stickman_2];
        this.animations.fight = [textures.stickman_2, textures.stickman_3, textures.stickman_4, textures.stickman_11];
        this.animations.strike = [textures.stickman_3, textures.stickman_4, textures.stickman_5];
        this.animations.crit = [
            textures.stickman_2, textures.stickman_3, textures.stickman_4, textures.stickman_11,
            textures.stickman_6, textures.stickman_7, textures.stickman_8, textures.stickman_10
        ];
    }

    public fight() {
        let critRate = [
            { value: false, rate: 100 - this.stats.crit },
            { value: true, rate: this.stats.crit }
        ]
        let isCrit = getRandomItemByRate(critRate).value;
        let damage = isCrit ? this.stats.atk * 2 : this.stats.atk;
        let hitRate = this.baseHitRate + this.stats.agi;

        return { isCrit: isCrit, damage: damage, hitRate: hitRate }
    }

    public move() {
        this.x += 1; // Move the player to the right
    }

    public run() {
        this.character.textures = this.animations.run;
        this.character.animationSpeed = 0.1;
        this.character.loop = true;
        this.character.gotoAndPlay(0);
    }

    public idle() {
        // this.character.textures = this.animations.idle;
        // this.character.animationSpeed = 0.005;
        // this.character.gotoAndPlay(0);
        this.removeChild(this.fightAnimation, this.critAnimation);
        this.addChild(this.character);
        this.character.gotoAndPlay(0);
    }

    public doFight(onComplete: () => void) {
        this.removeChild(this.character, this.critAnimation);
        this.addChild(this.fightAnimation);
        this.fightAnimation.animationSpeed = 0.1;
        this.fightAnimation.gotoAndPlay(0);
        this.fightAnimation.onComplete = () => {
            onComplete();
        };
    }

    public doCrit(onComplete: () => void) {
        this.removeChild(this.character, this.fightAnimation);
        this.addChild(this.critAnimation);
        this.critAnimation.animationSpeed = 0.1;
        this.critAnimation.gotoAndPlay(0);
        this.critAnimation.onComplete = () => {
            onComplete();
        };
    }

    public takeDamage(damage: number, hitRate: number) {
        this.stats.hp -= damage - this.stats.def;
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
        }
    }

    public applyStats(statsName: string, statsValue: number) {
        this.stats[statsName] += statsValue
        this.supportStats[statsName] += statsValue;
    }
}
