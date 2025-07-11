import { Graphics, Container, Text } from 'pixi.js';
import { Warrior } from './Warrior';
import { Mew } from './Mew';

export class CombatScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        
        this.bulletTotal = 0;

        this.addLine();
        this.addInventory();
        this.addWarrior();
        this.addMew();
    }

    addChild(child) {
        this.view.addChild(child);
    }

    removeChild(child) {
        this.view.removeChild(child);
    }

    addLine() {
        const line = new Graphics()
            .moveTo(0, 135)
            .lineTo(this.app.canvas.width, 135)
            .stroke({
                color: 0x55ffaa
            });

        this.view.addChild(line);
    }

    addInventory() {
        const inventory = new Text({
            text: 'Click to add bullets ' + this.bulletTotal,
            style: {
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: { color: 0x4a1850, alpha: 1 },
                stroke: { color: 0x4a1850, width: 5 },
                dropShadow: {
                color: 0x000000,
                angle: Math.PI / 6,
                blur: 4,
                distance: 6,
                },
                wordWrap: true,
                wordWrapWidth: 440,
            }
        });
        inventory.x = Math.round((this.view.width - inventory.width) / 2);
        inventory.y = 150

        inventory.interactive = true;
        inventory.cursor = "pointer";
        inventory.buttonMode = true;
        inventory.on("click", this.addBullets.bind(this));

        this.view.addChild(inventory);
    }

    async addWarrior() {
        this.warrior = new Warrior(this.app, this);
        await this.warrior.init();
        this.view.addChild(this.warrior.sprite);
    }

    async addMew() {
        this.mew = new Mew(this.app, this);
        await this.mew.init();
        this.view.addChild(this.mew.sprite);
    }

    addBullets() {
        this.bulletTotal += 1;
    }

    update() {
        this.warrior.update();
        this.mew.update();

        for (let bullet of this.warrior.bullets) {
            if (this.testForAABB(bullet, this.mew.sprite)) {
                this.mew.hitBullet();
                this.warrior.bullets.shift();
                this.removeChild(bullet);
            } else {
                //this.mew.continueRunning();
            }
        }
    }

    testForAABB(object1, object2) {
        const bounds1 = object1.getBounds();
        const bounds2 = object2.getBounds();

        return (bounds1.x >= bounds2.x);

        // return (
        //     bounds1.x < bounds2.x + bounds2.width &&
        //     bounds1.x + bounds1.width > bounds2.x &&
        //     bounds1.y < bounds2.y + bounds2.height &&
        //     bounds1.y + bounds1.height > bounds2.y
        // );
    }
}
