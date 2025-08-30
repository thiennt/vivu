import { BlocklastLogic } from './BlocklastLogic';
import { AIPlayer } from './AIPlayer';
import { Player } from './types';

export class GameManager {
    private logic: BlocklastLogic;
    private aiPlayer: AIPlayer;
    private onStateChange: ((gameState: any) => void) | null = null;
    private onGameEnd: ((winner: Player | null) => void) | null = null;

    constructor() {
        this.logic = new BlocklastLogic();
        this.aiPlayer = new AIPlayer(this.logic);
    }

    public setStateChangeCallback(callback: (gameState: any) => void): void {
        this.onStateChange = callback;
    }

    public setGameEndCallback(callback: (winner: Player | null) => void): void {
        this.onGameEnd = callback;
    }

    public getGameState() {
        return this.logic.getGameState();
    }

    public startGame(): void {
        this.notifyStateChange();
    }

    public async playerPlaceBrick(brickIndex: number, row: number, col: number): Promise<boolean> {
        const gameState = this.logic.getGameState();
        
        if (gameState.currentPlayer !== Player.HUMAN || gameState.gameOver) {
            return false;
        }

        if (brickIndex < 0 || brickIndex >= gameState.playerBricks.length) {
            return false;
        }

        const brick = gameState.playerBricks[brickIndex];
        const result = this.logic.placeBrick(brick, row, col);

        if (result.success) {
            // Remove the used brick
            gameState.playerBricks.splice(brickIndex, 1);
            
            this.logic.checkGameEnd();
            this.notifyStateChange();

            if (gameState.gameOver) {
                this.notifyGameEnd();
                return true;
            }

            // Switch to AI turn
            this.logic.nextTurn();
            this.notifyStateChange();

            // AI plays automatically after a short delay
            setTimeout(() => {
                this.playAITurn();
            }, 1000);

            return true;
        }

        return false;
    }

    private async playAITurn(): Promise<void> {
        const gameState = this.logic.getGameState();
        
        if (gameState.currentPlayer !== Player.AI || gameState.gameOver) {
            return;
        }

        const aiMove = this.aiPlayer.selectAndPlaceBrick();
        
        if (aiMove) {
            const brick = gameState.aiBricks[aiMove.brickIndex];
            const result = this.logic.placeBrick(brick, aiMove.row, aiMove.col);

            if (result.success) {
                // Remove the used brick
                gameState.aiBricks.splice(aiMove.brickIndex, 1);
                
                this.logic.checkGameEnd();
                this.notifyStateChange();

                if (gameState.gameOver) {
                    this.notifyGameEnd();
                    return;
                }

                // Switch back to player turn
                this.logic.nextTurn();
                this.notifyStateChange();
            }
        } else {
            // AI cannot make a move, check for game end
            this.logic.checkGameEnd();
            this.notifyStateChange();
            
            if (gameState.gameOver) {
                this.notifyGameEnd();
            }
        }
    }

    public canPlayerPlaceBrick(brickIndex: number, row: number, col: number): boolean {
        const gameState = this.logic.getGameState();
        
        if (gameState.currentPlayer !== Player.HUMAN || gameState.gameOver) {
            return false;
        }

        if (brickIndex < 0 || brickIndex >= gameState.playerBricks.length) {
            return false;
        }

        const brick = gameState.playerBricks[brickIndex];
        return this.logic.canPlaceBrick(brick, row, col);
    }

    public getAvailablePositions(brickIndex: number): { row: number; col: number }[] {
        const gameState = this.logic.getGameState();
        const positions: { row: number; col: number }[] = [];
        
        if (gameState.currentPlayer !== Player.HUMAN || gameState.gameOver) {
            return positions;
        }

        if (brickIndex < 0 || brickIndex >= gameState.playerBricks.length) {
            return positions;
        }

        const brick = gameState.playerBricks[brickIndex];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.logic.canPlaceBrick(brick, row, col)) {
                    positions.push({ row, col });
                }
            }
        }

        return positions;
    }

    private notifyStateChange(): void {
        if (this.onStateChange) {
            this.onStateChange(this.logic.getGameState());
        }
    }

    private notifyGameEnd(): void {
        const gameState = this.logic.getGameState();
        if (this.onGameEnd && gameState.gameOver) {
            this.onGameEnd(gameState.winner);
        }
    }

    public restartGame(): void {
        this.logic = new BlocklastLogic();
        this.aiPlayer = new AIPlayer(this.logic);
        this.notifyStateChange();
    }
}