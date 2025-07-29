import { Graphics, Container, Text, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { Warrior } from './Warrior';
import { Mew } from './Mew';
import { Box } from './Box';
import { testForAABB, delay } from './util';

// Dynamic import for GIF functionality since this is a JS file
async function loadGifExporter() {
    const module = await import('./utils/GifExporter.js');
    return module.GifExporter;
}

export class CombatScene {
    constructor(app) {
        this.app = app;
        this.view = new Container();
        this.view.isRenderGroup = true;
        
        this.bulletTotal = 0;
        this.gameState = 0;
        this.isExporting = false;
        this.gifExporter = null;
        
        // Initialize GIF export functionality
        this.initGifExport();
    }

    init() {
        this.addBackground();
        this.addWarrior();
        this.addMew();
        this.addBoxes();
        this.createExportButton();
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

        this.boomTexture = await Assets.load('boom');
        this.boomSprite = new Sprite(this.boomTexture);
        
        this.heroSheet = await Assets.load('stickman');
        this.heroSprite = new AnimatedSprite(this.heroSheet.animations.idle);
        
        this.monsterSheet = await Assets.load('demon');
        this.monsterSprite = new AnimatedSprite(this.monsterSheet.animations.run);

    }
    
    showBoomEffect(x, y) {
        this.boomSprite.position.set(x, y);
        this.boomSprite.visible = true;
        this.addChild(this.boomSprite);
    }

    hideBoomEffect() {
        this.boomSprite.visible = false;
    }

    async addBackground() {
        // const texture = await Assets.load('images/dungeon_2.png');
        // this.background = new Sprite({
        //     texture: texture,
        //     anchor: 0.5,
        //     //scale: { x: 1, y: 1 },
        //     //width: 400,
        //     //height: 400
        // });

        // // Center background sprite anchor.
        // let y = this.app.canvas.height / 3;
        // this.background.position.set(this.app.canvas.width / 2, y);
        // this.background.zIndex = -1; // Ensure background is behind other elements

        // this.LINE_Y = y + this.background.height / 2;

        // this.addChild(this.background);

        this.LINE_Y = this.app.canvas.height /2;

        let y = this.LINE_Y + 100;
        let x = 50;

        let background = new Graphics()
            .rect(0, this.app.canvas.height /2, this.app.canvas.width, 50)
            .fill('000000')
            .stroke({ width: 1, color: "333333" });        
        this.addChild(background);
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

    addLine() {
        const line = new Graphics()
            .moveTo(0, 200)
            .lineTo(this.app.canvas.width, this.LINE_Y)
            .stroke({
                color: 0x55ffaa
            });

        this.view.addChild(line);
    }

    addBoxes() {
        this.box = new Box(this.app, this);
        this.box.init();
        this.view.addChild(this.box.view);
    }

    removeCards() {
        this.view.removeChild(this.box.view);
    }

    showSelectedEffect(effect, effectValue, cardType) {
        this.removeCards();

         // Card text
        let cardColor = "000000";
        let textLabel =  `${effectValue.value}% ${effect.toUpperCase()}`;

        if (effectValue.value > 0) {
            cardColor = "ffffff";
            textLabel = `+${effectValue.value}% ${effect.toUpperCase()}`;
        }

        let txtCard = new Text({
            text: cardType == 0 ? "HERO: " + textLabel : "MONSTER: " + textLabel,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: { color: "000000", alpha: 1 },
                stroke: { color: "ffffff", width: 2 },
                //wordWrap: true,
                //wordWrapWidth: 50,
                align: "center"
            }
        });
        txtCard.anchor.set(0.5, 0.5);
        txtCard.x = this.app.canvas.width / 2;;
        txtCard.y = this.LINE_Y - 150;

        this.view.addChild(txtCard);

        this.reloadCardsAfterEffect(txtCard);

    }

    async reloadCardsAfterEffect(selectedCard) {
        await delay(2000);

        this.view.removeChild(selectedCard);
        this.addBoxes();
    }

    resetBoxes() {
        this.view.removeChild(this.box.view);
        this.addBoxes();
    }

    async addWarrior() {
        this.warrior = new Warrior(this.app, this);
        this.warrior.init();
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
        // if (!this.box.isLoaded) {
        //     this.box.addBoxes();
        //     this.box.isLoaded = true;
        // }

        for (let bullet of this.warrior.bullets) {
            if (testForAABB(bullet.sprite, this.mew.sprite)) {
                this.mew.hitBullet(bullet);
                this.warrior.bullets.shift();
                this.removeChild(bullet.sprite);
            } else {
                //this.mew.continueRunning();
            }
        }
    }

    warriorLose() {
        this.gameState = 1;

        this.mew.sprite.textures = this.mew.sheet.animations.idle;
        this.mew.sprite.gotoAndPlay(0);
        this.mew.state.idle = true;

        const loseText = new Text({
            text: 'You Lose!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: { color: 0xff0000, alpha: 1 },
                stroke: { color: 0x000000, width: 2 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 6,
                },
            }
        });
        loseText.x = Math.round((this.view.width - loseText.width) / 2);
        loseText.y = this.LINE_Y - 200;
        
        this.view.addChild(loseText);
    }

    warriorWin() {
        this.gameState = 1;
        
        this.mew.sprite.textures = this.mew.sheet.animations.idle;
        this.mew.sprite.gotoAndPlay(0);
        this.mew.state.idle = true;

        const winText = new Text({
            text: 'You Win!',
            style: {
                fontFamily: 'Arial',
                fontSize: 48,
                fill: { color: 0x85EF14, alpha: 1 },
                stroke: { color: 0x000000, width: 2 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 6,
                },
            }
        });
        winText.x = Math.round((this.view.width - winText.width) / 2);
        winText.y = this.LINE_Y - 200;

        this.view.addChild(winText);
    }

    // GIF Export functionality
    async initGifExport() {
        try {
            const GifExporter = await loadGifExporter();
            this.gifExporter = new GifExporter(this.app, {
                width: 400,
                height: 300,
                duration: 5,
                framerate: 10,
                quality: 8
            });
            console.log('GIF exporter initialized');
        } catch (error) {
            console.error('Failed to initialize GIF exporter:', error);
        }
    }

    createExportButton() {
        console.log('Creating export button in JS CombatScene...');
        
        // Create button background
        this.exportButton = new Graphics();
        this.exportButton.roundRect(0, 0, 100, 35, 5);
        this.exportButton.fill(0x4CAF50);
        this.exportButton.stroke({ width: 2, color: 0x2E7D32 });

        // Create button text
        this.exportText = new Text({
            text: 'Export GIF',
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xFFFFFF,
                align: 'center'
            }
        });
        this.exportText.anchor.set(0.5);
        this.exportText.x = 50;
        this.exportText.y = 17.5;

        this.exportButton.addChild(this.exportText);
        this.exportButton.cursor = 'pointer';
        this.exportButton.interactive = true;

        // Position button in top-right area, accounting for narrow screens
        this.exportButton.x = Math.max(10, this.app.canvas.width - 110);
        this.exportButton.y = 10;

        // Add click handler
        this.exportButton.on('pointerdown', () => this.toggleGifExport());

        this.addChild(this.exportButton);
        console.log('Export button created and added to JS CombatScene');
    }

    async toggleGifExport() {
        if (!this.gifExporter) {
            console.error('GIF exporter not initialized');
            return;
        }

        if (this.isExporting) {
            await this.stopGifExport();
        } else {
            this.startGifExport();
        }
    }

    startGifExport() {
        if (this.isExporting || !this.gifExporter) return;

        this.isExporting = true;
        this.updateExportButton();

        try {
            this.gifExporter.startRecording(this.view);
            console.log('Started GIF export recording...');
        } catch (error) {
            console.error('Failed to start GIF recording:', error);
            this.isExporting = false;
            this.updateExportButton();
        }
    }

    async stopGifExport() {
        if (!this.isExporting || !this.gifExporter) return;

        this.updateExportButton('Processing...');

        try {
            const GifExporter = await loadGifExporter();
            const gifBlob = await this.gifExporter.stopRecording();
            GifExporter.downloadBlob(gifBlob, `combat-scene-${Date.now()}.gif`);
            console.log('GIF export completed successfully!');
        } catch (error) {
            console.error('Failed to export GIF:', error);
        } finally {
            this.isExporting = false;
            this.updateExportButton();
        }
    }

    updateExportButton(customText) {
        if (!this.exportButton || !this.exportText) return;

        if (customText) {
            this.exportText.text = customText;
            this.exportButton.clear();
            this.exportButton.roundRect(0, 0, 100, 35, 5);
            this.exportButton.fill(0xFF9800);
            this.exportButton.stroke({ width: 2, color: 0xE65100 });
        } else if (this.isExporting) {
            this.exportText.text = 'Stop Export';
            this.exportButton.clear();
            this.exportButton.roundRect(0, 0, 100, 35, 5);
            this.exportButton.fill(0xF44336);
            this.exportButton.stroke({ width: 2, color: 0xC62828 });
        } else {
            this.exportText.text = 'Export GIF';
            this.exportButton.clear();
            this.exportButton.roundRect(0, 0, 100, 35, 5);
            this.exportButton.fill(0x4CAF50);
            this.exportButton.stroke({ width: 2, color: 0x2E7D32 });
        }
    }

    // Public method to export GIF programmatically
    async exportToGif(options) {
        if (!this.gifExporter) {
            const GifExporter = await loadGifExporter();
            const exporter = new GifExporter(this.app, options);
            
            return new Promise((resolve, reject) => {
                exporter.startRecording(this.view);
                
                setTimeout(async () => {
                    try {
                        const blob = await exporter.stopRecording();
                        resolve(blob);
                    } catch (error) {
                        reject(error);
                    }
                }, (options?.duration || 3) * 1000);
            });
        }
        
        return this.exportToGif(options);
    }
}
