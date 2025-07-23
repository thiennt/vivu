import { AnimatedSprite, Assets, Graphics, Text } from 'pixi.js';
import { getRandomItemByRate } from './util.js';

export class Bullet {
    constructor(app, scene) {
        this.app = app;
        this.scene = scene;

        this.init();
        this.calculateDamge();
    }

    init() {
        this.sprite = new Graphics()
            .circle(this.scene.warrior.sprite.position.x + 35, this.scene.warrior.sprite.position.y - 20, 5)
            .fill({
                color: 0x000000,
                alpha: 1
            });
    }

    move() {
        this.sprite.x += 1;
    }

    calculateDamge() {
        let heroStats = this.scene.warrior.stats;
        this.atk = heroStats["atk"];
        let crit = parseFloat(heroStats["crit"]);

        // check if critial strike occurs
        let critRate = [
            { value: 0, rate: 100 - crit },
            { value: 1, rate: crit }
        ]

        let isCrit = getRandomItemByRate(critRate);
        if (isCrit.value == 1) {
            this.atk *= 2;
            this.reDraw();
        }
    }

    reDraw() {
        this.sprite.clear()
            .circle(this.scene.warrior.sprite.position.x + 35, this.scene.warrior.sprite.position.y - 20, 5)
            .fill({
                color: "yellow",
                alpha: 1
            });
    }
}
