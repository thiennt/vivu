import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { GameManager } from '../game/GameManager';
import { Player, Brick, Cell, BOARD_SIZE } from '../game/types';

export class BlocklastScene extends Container {
    private gameManager: GameManager;
    private boardContainer: Container;
    private brickContainer: Container;
    private uiContainer: Container;
    
    private boardGraphics: Graphics[][] = [];
    private cellSize = 40;
    private boardOffsetX = 50;
    private boardOffsetY = 100;
    
    private playerBrickGraphics: Container[] = [];
    private selectedBrickIndex: number = -1;
    private hoveredPosition: { row: number; col: number } | null = null;
    
    private playerHpText: Text;
    private aiHpText: Text;
    private turnText: Text;
    private gameOverText: Text;
    
    private powerTexts: Text[][] = [];

    constructor() {
        super();
        
        this.gameManager = new GameManager();
        
        // Initialize containers first
        this.boardContainer = new Container();
        this.brickContainer = new Container();
        this.uiContainer = new Container();
        
        // Initialize UI elements
        this.playerHpText = new Text();
        this.aiHpText = new Text();
        this.turnText = new Text();
        this.gameOverText = new Text();
        
        this.setupContainers();
        this.setupUI();
        this.setupBoard();
        this.setupEventHandlers();
        
        this.gameManager.setStateChangeCallback(this.onGameStateChanged.bind(this));
        this.gameManager.setGameEndCallback(this.onGameEnd.bind(this));
    }

    private setupContainers(): void {
        this.addChild(this.boardContainer);
        this.addChild(this.brickContainer);
        this.addChild(this.uiContainer);
    }

    private setupUI(): void {
        // HP display
        this.playerHpText.text = 'Player HP: 20';
        this.playerHpText.style = {
            fontSize: 18,
            fill: 0x00ff00,
            fontFamily: 'Arial'
        };
        this.playerHpText.x = 20;
        this.playerHpText.y = 20;
        this.uiContainer.addChild(this.playerHpText);

        this.aiHpText.text = 'AI HP: 20';
        this.aiHpText.style = {
            fontSize: 18,
            fill: 0xff0000,
            fontFamily: 'Arial'
        };
        this.aiHpText.x = 20;
        this.aiHpText.y = 50;
        this.uiContainer.addChild(this.aiHpText);

        // Turn indicator
        this.turnText.text = 'Your Turn';
        this.turnText.style = {
            fontSize: 20,
            fill: 0xffffff,
            fontFamily: 'Arial'
        };
        this.turnText.x = 200;
        this.turnText.y = 30;
        this.uiContainer.addChild(this.turnText);

        // Game over text (initially hidden)
        this.gameOverText.text = '';
        this.gameOverText.style = {
            fontSize: 24,
            fill: 0xffff00,
            fontFamily: 'Arial'
        };
        this.gameOverText.x = 150;
        this.gameOverText.y = 250;
        this.gameOverText.visible = false;
        this.uiContainer.addChild(this.gameOverText);
    }

    private setupBoard(): void {
        this.boardGraphics = [];
        this.powerTexts = [];
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            this.boardGraphics[row] = [];
            this.powerTexts[row] = [];
            
            for (let col = 0; col < BOARD_SIZE; col++) {
                // Board cell background
                const cellBg = new Graphics();
                cellBg.rect(0, 0, this.cellSize, this.cellSize);
                cellBg.fill(0x333333);
                cellBg.stroke({ width: 1, color: 0x666666 });
                
                cellBg.x = this.boardOffsetX + col * this.cellSize;
                cellBg.y = this.boardOffsetY + row * this.cellSize;
                cellBg.interactive = true;
                cellBg.cursor = 'pointer';
                
                // Add click handler
                cellBg.on('pointerdown', () => this.onCellClick(row, col));
                cellBg.on('pointerover', () => this.onCellHover(row, col));
                cellBg.on('pointerout', () => this.onCellOut());
                
                this.boardContainer.addChild(cellBg);
                this.boardGraphics[row][col] = cellBg;

                // Power text
                const powerText = new Text();
                powerText.text = '';
                powerText.style = {
                    fontSize: 14,
                    fill: 0xffffff,
                    fontFamily: 'Arial'
                };
                powerText.anchor.set(0.5);
                powerText.x = cellBg.x + this.cellSize / 2;
                powerText.y = cellBg.y + this.cellSize / 2;
                this.boardContainer.addChild(powerText);
                this.powerTexts[row][col] = powerText;
            }
        }
    }

    private setupEventHandlers(): void {
        // Add restart button
        const restartBtn = new Graphics();
        restartBtn.rect(0, 0, 100, 30);
        restartBtn.fill(0x4CAF50);
        restartBtn.x = 350;
        restartBtn.y = 20;
        restartBtn.interactive = true;
        restartBtn.cursor = 'pointer';
        restartBtn.on('pointerdown', () => this.restartGame());
        this.uiContainer.addChild(restartBtn);

        const restartText = new Text();
        restartText.text = 'Restart';
        restartText.style = {
            fontSize: 14,
            fill: 0xffffff,
            fontFamily: 'Arial'
        };
        restartText.anchor.set(0.5);
        restartText.x = restartBtn.x + 50;
        restartText.y = restartBtn.y + 15;
        this.uiContainer.addChild(restartText);
    }

    private onCellClick(row: number, col: number): void {
        if (this.selectedBrickIndex >= 0) {
            this.gameManager.playerPlaceBrick(this.selectedBrickIndex, row, col);
        }
    }

    private onCellHover(row: number, col: number): void {
        this.hoveredPosition = { row, col };
        this.updateBrickPreview();
    }

    private onCellOut(): void {
        this.hoveredPosition = null;
        this.updateBrickPreview();
    }

    private updateBrickPreview(): void {
        // Clear previous preview
        this.brickContainer.children.forEach(child => {
            if (child.name === 'preview') {
                child.visible = false;
            }
        });

        if (this.selectedBrickIndex >= 0 && this.hoveredPosition) {
            const gameState = this.gameManager.getGameState();
            const brick = gameState.playerBricks[this.selectedBrickIndex];
            
            if (brick && this.gameManager.canPlayerPlaceBrick(this.selectedBrickIndex, this.hoveredPosition.row, this.hoveredPosition.col)) {
                this.showBrickPreview(brick, this.hoveredPosition.row, this.hoveredPosition.col);
            }
        }
    }

    private showBrickPreview(brick: Brick, startRow: number, startCol: number): void {
        brick.cells.forEach(cell => {
            const boardRow = startRow + cell.localRow;
            const boardCol = startCol + cell.localCol;
            
            if (boardRow >= 0 && boardRow < BOARD_SIZE && boardCol >= 0 && boardCol < BOARD_SIZE) {
                const preview = new Graphics();
                preview.rect(0, 0, this.cellSize, this.cellSize);
                preview.fill({ color: 0x00ff00, alpha: 0.5 });
                preview.x = this.boardOffsetX + boardCol * this.cellSize;
                preview.y = this.boardOffsetY + boardRow * this.cellSize;
                preview.name = 'preview';
                this.brickContainer.addChild(preview);
            }
        });
    }

    private updateBoard(gameState: any): void {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell: Cell = gameState.board[row][col];
                const cellGraphics = this.boardGraphics[row][col];
                const powerText = this.powerTexts[row][col];
                
                cellGraphics.clear();
                cellGraphics.rect(0, 0, this.cellSize, this.cellSize);
                
                if (cell.owner === Player.HUMAN) {
                    cellGraphics.fill(0x0066cc);
                } else if (cell.owner === Player.AI) {
                    cellGraphics.fill(0xcc0066);
                } else {
                    cellGraphics.fill(0x333333);
                }
                
                cellGraphics.stroke({ width: 1, color: 0x666666 });
                
                // Update power text
                if (cell.owner && cell.power > 0) {
                    powerText.text = cell.power.toString();
                    powerText.visible = true;
                } else {
                    powerText.visible = false;
                }
            }
        }
    }

    private updatePlayerBricks(gameState: any): void {
        // Clear existing brick displays
        this.playerBrickGraphics.forEach(container => container.destroy());
        this.playerBrickGraphics = [];

        // Display player bricks
        gameState.playerBricks.forEach((brick: Brick, index: number) => {
            const brickContainer = this.createBrickDisplay(brick, index);
            brickContainer.x = 50 + index * 120;
            brickContainer.y = 450;
            
            brickContainer.interactive = true;
            brickContainer.cursor = 'pointer';
            brickContainer.on('pointerdown', () => this.selectBrick(index));
            
            this.brickContainer.addChild(brickContainer);
            this.playerBrickGraphics.push(brickContainer);
        });

        // Update selection highlight
        this.updateBrickSelection();
    }

    private createBrickDisplay(brick: Brick, index: number): Container {
        const container = new Container();
        
        // Background
        const bg = new Graphics();
        bg.rect(0, 0, 100, 80);
        bg.fill(this.selectedBrickIndex === index ? 0x444444 : 0x222222);
        bg.stroke({ width: 2, color: this.selectedBrickIndex === index ? 0xffff00 : 0x666666 });
        container.addChild(bg);

        // Brick cells
        const minRow = Math.min(...brick.cells.map(c => c.localRow));
        const minCol = Math.min(...brick.cells.map(c => c.localCol));
        const cellDisplaySize = 15;
        
        brick.cells.forEach(cell => {
            const cellGraphics = new Graphics();
            cellGraphics.rect(0, 0, cellDisplaySize, cellDisplaySize);
            cellGraphics.fill(brick.owner === Player.HUMAN ? 0x0066cc : 0xcc0066);
            cellGraphics.stroke({ width: 1, color: 0x666666 });
            
            cellGraphics.x = 20 + (cell.localCol - minCol) * cellDisplaySize;
            cellGraphics.y = 20 + (cell.localRow - minRow) * cellDisplaySize;
            
            container.addChild(cellGraphics);

            // Power text
            const powerText = new Text();
            powerText.text = cell.power.toString();
            powerText.style = {
                fontSize: 10,
                fill: 0xffffff,
                fontFamily: 'Arial'
            };
            powerText.anchor.set(0.5);
            powerText.x = cellGraphics.x + cellDisplaySize / 2;
            powerText.y = cellGraphics.y + cellDisplaySize / 2;
            container.addChild(powerText);
        });

        return container;
    }

    private selectBrick(index: number): void {
        this.selectedBrickIndex = this.selectedBrickIndex === index ? -1 : index;
        this.updateBrickSelection();
    }

    private updateBrickSelection(): void {
        this.playerBrickGraphics.forEach((container, index) => {
            const bg = container.children[0] as Graphics;
            bg.clear();
            bg.rect(0, 0, 100, 80);
            bg.fill(this.selectedBrickIndex === index ? 0x444444 : 0x222222);
            bg.stroke({ width: 2, color: this.selectedBrickIndex === index ? 0xffff00 : 0x666666 });
        });
    }

    private onGameStateChanged(gameState: any): void {
        this.updateBoard(gameState);
        this.updatePlayerBricks(gameState);
        
        // Update UI
        this.playerHpText.text = `Player HP: ${gameState.playerHp}`;
        this.aiHpText.text = `AI HP: ${gameState.aiHp}`;
        
        if (gameState.currentPlayer === Player.HUMAN) {
            this.turnText.text = 'Your Turn';
            this.turnText.style.fill = 0x00ff00;
        } else {
            this.turnText.text = 'AI Turn';
            this.turnText.style.fill = 0xff0000;
        }
    }

    private onGameEnd(winner: Player | null): void {
        if (winner === Player.HUMAN) {
            this.gameOverText.text = 'You Win!';
            this.gameOverText.style.fill = 0x00ff00;
        } else if (winner === Player.AI) {
            this.gameOverText.text = 'AI Wins!';
            this.gameOverText.style.fill = 0xff0000;
        } else {
            this.gameOverText.text = 'Draw!';
            this.gameOverText.style.fill = 0xffff00;
        }
        
        this.gameOverText.visible = true;
        this.selectedBrickIndex = -1;
        this.updateBrickSelection();
    }

    private restartGame(): void {
        this.gameManager.restartGame();
        this.selectedBrickIndex = -1;
        this.gameOverText.visible = false;
        
        // Clear brick preview
        this.brickContainer.children.forEach(child => {
            if (child.name === 'preview') {
                child.destroy();
            }
        });
    }

    public async show(): Promise<void> {
        this.gameManager.startGame();
    }

    public async hide(): Promise<void> {
        // Clean up if needed
    }

    public resize(width: number, height: number): void {
        // Adjust positioning based on screen size if needed
        const centerX = width / 2;
        
        // Center the board
        this.boardContainer.x = centerX - (BOARD_SIZE * this.cellSize) / 2 - this.boardOffsetX;
    }

    public update(time: Ticker): void {
        // Update logic if needed
    }
}