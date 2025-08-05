import { Container, Assets, AnimatedSprite, Sprite, Graphics, Text } from 'pixi.js';
import { getRandomItemByRate, AnimationSet } from '../utils/common';
import { fireAnimation, slashAnimation, thunderAnimation, windAnimation } from './SkillsAnimation';

import { Stats } from '../utils/common';
import { COLORS } from '../app';
import gsap from 'gsap';
import { Monster } from './Monster';
import { Hero } from './Hero';

export class Character extends Container {
    public maxHpBar: Graphics;
    public hpBar: Graphics;
    protected frame: Graphics;
    public avatar: Sprite;
    public username: Text;

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

        this.initAvatar();
    }

    public initFrame() {
        this.frame = new Graphics();
        this.frame.roundRect(-55, -55, 110, 110, 10)
            .fill(COLORS.RARITY.NOVICE);
        this.addChild(this.frame);
    }

    public initHpBar() {
        this.maxHpBar = new Graphics();
        this.maxHpBar.roundRect(-55, -60, 110, 3, 5)
            .fill('#000000');
        this.addChild(this.maxHpBar);

        this.hpBar = new Graphics();
        this.hpBar.roundRect(-55, -60, 110, 3, 5)
            .fill('red');
        this.addChild(this.hpBar);
    }

    public initAvatar() {
        this.avatar = new Sprite(Assets.get('plus'));
        this.avatar.anchor = 0.5;
        this.avatar.scale.set(2);
        this.addChild(this.avatar);
    }

    public updateHpBar() {
        let healthPercentage = this.stats.hp / this.stats.maxHp;

        this.hpBar.clear()
            .rect(-55, -60, 110 * healthPercentage, 5)
            .fill('red');
    }

    public takeDamage(damage: number) {
        this.stats.hp -= damage;
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
        }

        this.updateHpBar();
    }

    public isDie(): boolean {
        return this.stats.hp <= 0;
    }

    public attack(
        target: Hero | Monster, 
        animationFn: ({ x, y, direction, scale }: { x: number; y: number; direction: 'up' | 'down'; scale: number }) => Sprite,
        direction: 'up' | 'down' = 'up'
    ) {
        let originalX = this.x;
        let originalY = this.y;

        const slashAnim = animationFn({ x: target.x, y: target.y, direction: 'up', scale: 1 });
        if (direction === 'down') {
            slashAnim.scale.x = -1;
            slashAnim.scale.y = -1;
        }

        gsap.to(this, {
            x: target.x,
            y: target.y,
            duration: 0.2,
            ease: 'power1.out',
            onComplete: () => {
                this.parent.addChild(slashAnim);
                gsap.to(slashAnim, {
                    ease: 'linear',
                    duration: 0.2,
                    onComplete: () => {
                        this.parent.removeChild(slashAnim);
                    }
                });

                gsap.to(this, {
                    x: originalX,
                    y: originalY,
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
        });
    }

    public rangeAttack(
        target: Hero | Monster, 
        animationFn: ({ x, y, direction, scale }: { x: number; y: number; direction: 'up' | 'down'; scale: number }) => Sprite,
        direction: 'up' | 'down' = 'up'
    ) {
        let originalX = this.x;
        let originalY = this.y;

        const animation = animationFn({ x: originalX, y: originalY, direction, scale: 1 });

        gsap.to(this, {
            y: direction === 'up' ? originalY - 20 : originalY + 20,
            duration: 0.2,
            ease: 'power1.out',
            onComplete: () => {
                this.parent.addChild(animation);
                gsap.fromTo(animation, {
                    autoAlpha: 0, x: originalX, y: originalY
                }, {
                    autoAlpha: 1,
                    x: target.x,
                    y: target.y,
                    ease: 'linear',
                    duration: 0.4,
                    onComplete: () => {
                        this.parent.removeChild(animation);
                    }
                });

                gsap.to(this, {
                    x: originalX,
                    y: originalY,
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
        });
    }

    public unleashSlash(target: Hero | Monster, direction: 'up' | 'down') {
        this.attack(target, slashAnimation, direction);
    }

    public unleashFire(target: Hero | Monster, direction: 'up' | 'down') {
        this.rangeAttack(target, fireAnimation, direction);
    }

    public unleashWind(target: Hero | Monster, direction: 'up' | 'down') {
        this.rangeAttack(target, windAnimation, direction);
    }

    public unleashThunder(target: Hero | Monster, direction: 'up' | 'down') {
        this.rangeAttack(target, thunderAnimation, direction);
    }

}