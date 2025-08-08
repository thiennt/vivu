import { Assets, Sprite, Graphics, Text } from 'pixi.js';
import { Character } from './Character';
import { COLORS } from '../app';

export class Hero extends Character {

    constructor(options?: { rarity?: string }) {
        super();

        this.initFrame(options?.rarity || 'novice');
        this.initAvatar();
        this.initName();
        this.initHpBar();
    }

    public initAvatar() {
        this.avatar = new Sprite(Assets.get('avatar'));
        this.avatar.anchor = 0.5;
        this.avatar.scale.set(0.5);
        this.addChild(this.avatar);
    }

    public initName() {
        this.username = new Text({
            text: 'Hero',
            style: { fontSize: 16, fill: COLORS.white, fontWeight: 'bold' }
        });
        this.username.anchor.set(0.5);
        this.username.position.set(0, 70);
        this.addChild(this.username);
    }
}