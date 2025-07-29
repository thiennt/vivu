import { Container, Ticker, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { GifExporter, GifExportOptions } from '../utils/GifExporter';

import { Player } from './Player';
import { Enemy } from './Enemy';
import { StatsArea } from './StatsArea';
import { app } from '../app';


export class CombatScene extends Container {    
    private duelContainer: Container;
    private statsContainer: Container;
    private player: Player;
    private enemy: Enemy;
    private statsArea: StatsArea;
    private gifExporter: GifExporter;
    private exportButton!: Graphics;
    private exportText!: Text;
    private isExporting: boolean = false;

    private gameState = 0; // 0: start, 1: end
    private elapsedSeconds = 0;
    private turn = 0; // 0: player turn, 1: enemy turn

    constructor() {
        super();

        this.duelContainer = new Container();
        this.addChild(this.duelContainer);

        this.player = new Player();
        this.duelContainer.addChild(this.player);

        this.enemy = new Enemy();
        this.duelContainer.addChild(this.enemy);

        this.statsContainer = new Container();
        this.addChild(this.statsContainer);

        this.statsArea = new StatsArea();
        this.statsContainer.addChild(this.statsArea);

        // Initialize GIF exporter
        this.gifExporter = new GifExporter(app, {
            width: 400,
            height: 300,
            duration: 5,
            framerate: 10,
            quality: 8
        });

        // Create export button
        this.createExportButton();
    }

    public async show() {
    }

    public prepare() {
        this.statsArea.prepare(this.player, this.enemy);

        this.turn = this.player.stats.agi >= this.enemy.stats.agi ? 0 : 1; // 0: hero turn, 1: monster turn
    }

    public resize(width: number, height: number) {
        const centerX = width * 0.5;

        this.player.x = centerX - 60;
        this.player.y = -42;
        this.enemy.x = centerX + 60;
        this.enemy.y = -50;
        
        this.statsContainer.x = 0;
        this.statsContainer.y = -450;

        this.statsArea.resize(width, height);

        // Position export button in a visible location
        // Use absolute positioning from top-left of the container
        const buttonX = Math.max(10, width - 110); // 10px from right edge, but at least 10px from left
        const buttonY = Math.max(10, -height + 60); // 10px from top, accounting for container offset
        
        this.exportButton.x = buttonX;
        this.exportButton.y = buttonY;
        
        console.log(`Export button positioned at (${buttonX}, ${buttonY}) for canvas size ${width}x${height}`);
    }

    public update(time: Ticker) {
        if (this.gameState == 1) return;

        this.elapsedSeconds += time.deltaMS / 1000;
        if (this.elapsedSeconds >= 1.5) {
            if (this.turn == 0) {
                this.playerFight();
                this.turn = 1;
            } else {
                this.enemyFight();
                this.turn = 0;
            }

            if (this.player.stats.hp <= 0 || this.enemy.stats.hp <= 0) {
                this.gameState = 1;
            }

            this.statsArea.updateHp();
            this.elapsedSeconds = 0;
        }
    }

    public async playerFight() {
        let attack = this.player.fight();
        let delayTime = 1.6;

        if (attack.isCrit) {
            this.player.character.textures = this.player.animations.crit;
        } else {
            this.player.character.textures = this.player.animations.fight;
            delayTime = 0.8;
        }

        //this.player.x += 60;
        gsap.to(this.player, { x: this.player.x + 70, duration: 0.1, ease: 'back.out' });
        this.player.character.animationSpeed = 0.1;
        this.player.character.gotoAndPlay(0);
        
        this.enemy.takeDamage(attack.damage, attack.hitRate);

        await waitFor(delayTime);

        this.player.idle();
        gsap.to(this.player, { x: this.player.x - 70, duration: 0.1, ease: 'back.out' });
    }

    public async enemyFight() {
        let attack = this.enemy.fight();
        let delayTime = 1.2;

        if (attack.isCrit) {
            this.enemy.character.textures = this.enemy.animations.crit;
        } else {
            this.enemy.character.textures = this.enemy.animations.fight;
            delayTime = 0.6;
        }

        gsap.to(this.enemy, { x: this.enemy.x - 60, duration: 0.1, ease: 'back.out' });
        this.enemy.character.animationSpeed = 0.1;
        this.enemy.character.gotoAndPlay(0);

        this.player.takeDamage(attack.damage, attack.hitRate);

        await waitFor(delayTime);
        this.enemy.idle();
        gsap.to(this.enemy, { x: this.enemy.x + 60, duration: 0.1, ease: 'back.out' });
    }

    /**
     * Create the export button UI
     */
    private createExportButton() {
        console.log('Creating export button...');
        
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

        // Add click handler
        this.exportButton.on('pointerdown', () => this.toggleGifExport());

        this.addChild(this.exportButton);
        console.log('Export button created and added to scene');
    }

    /**
     * Toggle GIF export recording
     */
    private async toggleGifExport() {
        if (this.isExporting) {
            await this.stopGifExport();
        } else {
            this.startGifExport();
        }
    }

    /**
     * Start recording GIF
     */
    private startGifExport() {
        if (this.isExporting) return;

        this.isExporting = true;
        this.updateExportButton();

        try {
            this.gifExporter.startRecording(this.duelContainer);
            console.log('Started GIF export recording...');
        } catch (error) {
            console.error('Failed to start GIF recording:', error);
            this.isExporting = false;
            this.updateExportButton();
        }
    }

    /**
     * Stop recording and export GIF
     */
    private async stopGifExport() {
        if (!this.isExporting) return;

        this.updateExportButton('Processing...');

        try {
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

    /**
     * Update export button appearance and text
     */
    private updateExportButton(customText?: string) {
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

    /**
     * Export the combat scene to GIF with custom options
     */
    public async exportToGif(options?: GifExportOptions): Promise<Blob> {
        const exporter = new GifExporter(app, options);
        
        return new Promise((resolve, reject) => {
            exporter.startRecording(this.duelContainer);
            
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
}
