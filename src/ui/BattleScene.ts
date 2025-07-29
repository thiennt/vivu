import { Container, Ticker, Text, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';
import { testForAABB } from '../utils/common';
import { GifExporter, GifExportOptions } from '../utils/GifExporter';

import { Player } from './Player';
import { Enemy } from './Enemy';
import { StatsArea } from './StatsArea';
import { StatsSelection } from '../ui/StatsSelection';
import { app } from '../app';


export class BattleScene extends Container {    
    private duelContainer: Container;
    private statsContainer: Container;
    private player: Player;
    private enemy: Enemy;
    private statsArea: StatsArea;
    private gifExporter: GifExporter;
    private exportButton!: Graphics;
    private exportText!: Text;
    private isExporting: boolean = false;

    private statsSelection: StatsSelection;
    private statsElapsedSeconds = 0;
    private gameState = 0; // 0: begin, 1: stop to choose stats, 2: end

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

        this.statsSelection = new StatsSelection();
        this.addChild(this.statsSelection);

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

    public prepare() {
        this.statsArea.prepare(this.player, this.enemy);

        this.player.run();
    }

    public async show() {
        //this.startBattle();
    }

    public resize(width: number, height: number) {
        const centerX = width * 0.5;

        this.player.x = centerX - 200;
        this.player.y = -42;
        this.enemy.x = centerX + 200;
        this.enemy.y = -50;
        
        this.statsContainer.x = 0;
        this.statsContainer.y = -450;

        this.statsArea.resize(width, height);

        // Position export button in visible area
        this.exportButton.x = Math.max(10, width - 110);
        this.exportButton.y = Math.max(10, -height + 60);
        
        console.log(`Export button positioned at (${this.exportButton.x}, ${this.exportButton.y}) for BattleScene size ${width}x${height}`);
    }

    public async update(time: Ticker) {
        if (this.gameState == 2) return;

        if (this.gameState == 0) {
            this.statsElapsedSeconds += time.deltaMS / 1000;
            this.player.move(); // Move the player to the right
            
            if (this.player.x >= this.enemy.x - 60) {
                this.gameState = 2; // end the game
            }

            if (this.statsElapsedSeconds >= 0.5) {
                this.gameState = 1; // Stop the game to choose stats
                
                this.statsSelection.showSelection(this.player, this.enemy);
                this.statsSelection.onSelection = (character, statsName, statsValue) => {
                    this.onSelection(character, statsName, statsValue);
                };
                this.statsElapsedSeconds = 0;
            }
        }
    }

    public onSelection(character: Player | Enemy, statsName: string, statsValue: number) {
        this.gameState = 0; // continue the game
        this.statsSelection.removeChildren(); // Clear previous selections

        if (character instanceof Player) {
            this.player.applyStats(statsName, statsValue);
        } else {
            this.enemy.applyStats(statsName, statsValue);
        }

        this.statsArea.updateStats();

        let message = new Text();
        message.style = {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x000000,
            align: 'center'
        };
        message.anchor.set(0.5, 0.5);
        message.x = navigation.width * 0.5;
        message.y = -180;
        message.text = `${character instanceof Player ? 'Player:' : 'Enemy:'} ${statsValue}% ${statsName.toUpperCase()}`;

        let textLabel =  `${statsValue} ${statsName.toUpperCase()}`;
        if (statsValue > 0) {
            textLabel = `+${statsValue} ${statsName.toUpperCase()}`;
        } else if (statsValue < 0) {
            textLabel = `${statsValue} ${statsName.toUpperCase()}`;
        }
        message.text = `${character instanceof Player ? 'Player:' : 'Enemy:'} ${textLabel}`;
        this.addChild(message);
        gsap.to(message, {
            duration: 1,
            alpha: 1,
            onComplete: () => {
                this.removeChild(message);
            }
        });
    }

    /**
     * Create the export button UI
     */
    private createExportButton() {
        console.log('Creating export button for BattleScene...');
        
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
        console.log('Export button created and added to BattleScene');
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
            console.log('Started GIF export recording from BattleScene...');
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
            GifExporter.downloadBlob(gifBlob, `battle-scene-${Date.now()}.gif`);
            console.log('GIF export completed successfully from BattleScene!');
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
     * Export the battle scene to GIF with custom options
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