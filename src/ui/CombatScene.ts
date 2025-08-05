import { Assets, Container, Graphics, Sprite, Text, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';

import { Hero } from './Hero';
import { Monster } from './Monster';
import { COLORS } from '../app';
import { Character } from './Character';


export class CombatScene extends Container {
    private background: Sprite;

    private dungeon: Graphics;
    
    private player1: Hero;
    private player2: Hero;
    private player3: Character;
    private player4: Character;
    private monster1: Monster;
    private monster2: Monster;
    private monster3: Character;
    private monster4: Character;

    private roundNote: Text;

    private battleHistory: any[] = [];

    constructor() {
        super();

        this.background = new Sprite(Assets.get('background'));
        this.background.width = navigation.width;
        this.background.height = navigation.height;
        this.addChild(this.background);

        this.dungeon = new Graphics();
        this.dungeon.roundRect(20, 20, navigation.width - 40, navigation.height - 40, 10)
                    .fill(COLORS.FRAME_BORDER)
                    .roundRect(22, 22, navigation.width - 44, navigation.height - 44, 10)
                    .fill(COLORS.FRAME_LABEL);
        this.dungeon.alpha = 1;
        this.addChild(this.dungeon);

        this.roundNote = new Text({
            text: 'Round 1',
            style: { fontSize: 32, fill: 0xffffff }
        });
        this.roundNote.anchor.set(0.5);
        this.addChild(this.roundNote);

        this.player1 = new Hero();
        this.addChild(this.player1);

        this.player2 = new Hero();
        this.addChild(this.player2);

        this.player3 = new Character();
        this.addChild(this.player3);

        this.player4 = new Character();
        this.addChild(this.player4);

        this.monster1 = new Monster();
        this.addChild(this.monster1);

        this.monster2 = new Monster();
        this.addChild(this.monster2);

        this.monster3 = new Character();
        this.addChild(this.monster3);

        this.monster4 = new Character();
        this.addChild(this.monster4);
        
        this.battleHistory = [
            { round: 1, turn: 1, attacker: this.player1, targets: [ { target: this.monster1, is_missed: false, damage: 3 } ], action_name: 'unleashSlash', direction: 'up' },
            { round: 1, turn: 2, attacker: this.monster1, targets: [ { target: this.player1, is_missed: false, damage: 1 } ], action_name: 'unleashFire', direction: 'down' },
            { round: 1, turn: 3, attacker: this.player2, targets: [ { target: this.monster1, is_missed: false, damage: 4 } ], action_name: 'unleashWind', direction: 'up' },
            { round: 1, turn: 4, attacker: this.monster2, targets: [ { target: this.player2, is_missed: false, damage: 1 } ], action_name: 'unleashThunder', direction: 'down' },
            { round: 2, turn: 5, attacker: this.player1, targets: [ { target: this.monster1, is_missed: false, damage: 6 } ], action_name: 'unleashSlash', direction: 'up' },
            { round: 2, turn: 6, attacker: this.monster1, targets: [ { target: this.player1, is_missed: false, damage: 4 } ], action_name: 'unleashFire', direction: 'down' },
            { round: 2, turn: 7, attacker: this.player2, targets: [ { target: this.monster1, is_missed: false, damage: 6 } ], action_name: 'unleashWind', direction: 'up' },
            { round: 2, turn: 8, attacker: this.monster2, targets: [ { target: this.player2, is_missed: false, damage: 3 } ], action_name: 'unleashThunder', direction: 'down' },
        ];
    }


    public async show() {
        for (let i = 0; i < this.battleHistory.length; i++) {            
            const action = this.battleHistory[i];
            
            let attacker = action.attacker;
            let targets = action.targets;
            let target = targets[0].target;
            let actionName = action.action_name;
            let direction = action.direction;

            await waitFor(1.5);

            if (!attacker.isDie() && !target.isDie()) {
                attacker[actionName](target, direction);
                await waitFor(0.4);
                this.checkDamage(target, action.targets[0].damage);
            }
            
            if (i < this.battleHistory.length - 1) {
                this.roundNote.text = `Round ${this.battleHistory[i + 1].round}`;
            }
        }
    }

    public checkDamage(target: Hero | Monster, damage: number) {
        target.takeDamage(damage);
        
        if (target.stats.hp <= 0) {
            this.dieFlash(target);
        } else {
            this.damageFlash(target, damage);
        }
    }

    public damageFlash(target: Hero | Monster, damage: number) {
        const originalX = target.x;
        const originalY = target.y;

        gsap.to(target, {
            x: originalX + (Math.random() * 10 - 5),
            y: originalY + (Math.random() * 10 - 5),
            duration: 0.2,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                target.x = originalX;
                target.y = originalY;
            },
        });

        const damageImage = Assets.get('damage_flash');
        const damageSprite = new Sprite(damageImage);
        damageSprite.x = originalX;
        damageSprite.y = originalY;
        damageSprite.anchor.set(0.5);
        damageSprite.scale.set(0.4);
        this.addChild(damageSprite);

        gsap.to(damageSprite, {
            duration: 0.4,
            ease: 'power3.out',
            onComplete: () => {
                this.removeChild(damageSprite);
            }
        });

        const damageText = new Text({ 
            text: `-${damage}`, 
            style: { fontSize: 24, fill: 0xff0000 }   
        });
        damageText.anchor.set(0.5);
        damageText.x = originalX;
        damageText.y = originalY;
        this.addChild(damageText);

        gsap.to(damageText, {
            duration: 0.4,
            ease: 'power3.out',
            onComplete: () => {
                this.removeChild(damageText);
            }
        });
    }

    public dieFlash(target: Hero | Monster) {
        const targetX = target.x;
        const targetY = target.y;
        
        const dieImage = Assets.get('boom');
        const dieSprite = new Sprite(dieImage);
        dieSprite.x = targetX;
        dieSprite.y = targetY;
        dieSprite.anchor.set(0.5);
        dieSprite.scale.set(2);

        this.removeChild(target);
        this.addChild(dieSprite);

        gsap.to(dieSprite, {
            duration: 0.4,
            ease: 'power3.out',
            onComplete: () => {
                this.removeChild(dieSprite);
                const character = new Character();
                character.x = targetX;
                character.y = targetY;
                
                this.addChild(character);
            }
        });
    }

    public screenShake() {
        let originalX = this.x;
        let originalY = this.y;
        
        gsap.to(this, {
            x: originalX + (Math.random() * 10 - 5),
            y: originalY + (Math.random() * 10 - 5),
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                this.x = originalX;
                this.y = originalY;
            },
        });
    }   

    public async hide() {
    }

    public prepare() {
        
    }

    public resize(width: number, height: number) {
        const centerY = height / 2;
        this.roundNote.position.set(width / 2, 50);
        
        this.player1.position.set(width / 2 - 100, centerY + 150);
        this.player2.position.set(width / 2 + 100, centerY + 150);
        this.player3.position.set(width / 2 - 100, centerY + 300);
        this.player4.position.set(width / 2 + 100, centerY + 300);

        this.monster1.position.set(width / 2 - 100, centerY - 150);
        this.monster2.position.set(width / 2 + 100, centerY - 150);
        this.monster3.position.set(width / 2 - 100, centerY - 300);
        this.monster4.position.set(width / 2 + 100, centerY - 300);

    }

    public update(time: Ticker) {
        
    }

}
