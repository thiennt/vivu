import {
  Position,
  Cell,
  Brick,
  BrickType,
  BrickCell,
  Player,
  GameState,
  PlacementResult,
  BOARD_SIZE,
  INITIAL_HP,
  BRICKS_PER_TURN,
} from "./types";

export class BlocklastLogic {
  private gameState: GameState;

  constructor() {
    this.gameState = this.initializeGame();
  }

  private initializeGame(): GameState {
    // Initialize empty board
    const board: Cell[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = { power: 0, owner: null };
      }
    }

    return {
      board,
      playerHp: INITIAL_HP,
      aiHp: INITIAL_HP,
      currentPlayer: Player.HUMAN,
      playerBricks: this.generateRandomBricks(Player.HUMAN),
      aiBricks: this.generateRandomBricks(Player.AI),
      gameOver: false,
      winner: null,
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public generateRandomBricks(player: Player): Brick[] {
    const bricks: Brick[] = [];
    const brickTypes = Object.values(BrickType);

    for (let i = 0; i < BRICKS_PER_TURN; i++) {
      const type = brickTypes[Math.floor(Math.random() * brickTypes.length)];
      const cells = this.generateBrickCells(type);
      bricks.push({ type, cells, owner: player });
    }

    return bricks;
  }

  private generateBrickCells(type: BrickType): BrickCell[] {
    const cells: BrickCell[] = [];
    const pattern = this.getBrickPattern(type);

    pattern.forEach((pos) => {
      cells.push({
        power: Math.floor(Math.random() * 5) + 1, // Random power 1-5
        localRow: pos.row,
        localCol: pos.col,
      });
    });

    return cells;
  }

  private getBrickPattern(type: BrickType): Position[] {
    const patterns: Record<BrickType, Position[]> = {
      [BrickType.I]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ],
      [BrickType.O]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
      [BrickType.T]: [
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
      [BrickType.L]: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
      ],
      [BrickType.J]: [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 2, col: 0 },
      ],
      [BrickType.S]: [
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
      [BrickType.Z]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
    };

    return patterns[type];
  }

  public canPlaceBrick(
    brick: Brick,
    startRow: number,
    startCol: number,
  ): boolean {
    for (const cell of brick.cells) {
      const boardRow = startRow + cell.localRow;
      const boardCol = startCol + cell.localCol;

      // Check bounds
      if (
        boardRow < 0 ||
        boardRow >= BOARD_SIZE ||
        boardCol < 0 ||
        boardCol >= BOARD_SIZE
      ) {
        return false;
      }

      // Check if cell is occupied
      if (this.gameState.board[boardRow][boardCol].owner !== null) {
        return false;
      }
    }

    return true;
  }

  public placeBrick(
    brick: Brick,
    startRow: number,
    startCol: number,
  ): PlacementResult {
    if (!this.canPlaceBrick(brick, startRow, startCol)) {
      return { success: false };
    }

    // Place the brick
    brick.cells.forEach((cell) => {
      const boardRow = startRow + cell.localRow;
      const boardCol = startCol + cell.localCol;
      this.gameState.board[boardRow][boardCol] = {
        power: cell.power,
        owner: brick.owner,
      };
    });

    // Check for completed lines
    const completedLines = this.checkCompletedLines();
    let powerScores = { player: 0, ai: 0 };

    if (completedLines.length > 0) {
      powerScores = this.calculateLineScores(completedLines);
      this.clearCompletedLines(completedLines);
      this.applyDamage(powerScores);
    }

    return {
      success: true,
      completedLines,
      powerScores,
    };
  }

  private checkCompletedLines(): number[] {
    const completedLines: number[] = [];

    // Check rows
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (this.gameState.board[row].every((cell) => cell.owner !== null)) {
        completedLines.push(row);
      }
    }

    // Check columns
    for (let col = 0; col < BOARD_SIZE; col++) {
      let colComplete = true;
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (this.gameState.board[row][col].owner === null) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        completedLines.push(col + BOARD_SIZE); // Offset to distinguish from rows
      }
    }

    return completedLines;
  }

  private calculateLineScores(completedLines: number[]): {
    player: number;
    ai: number;
  } {
    let playerPower = 0;
    let aiPower = 0;

    completedLines.forEach((line) => {
      if (line < BOARD_SIZE) {
        // Row
        this.gameState.board[line].forEach((cell) => {
          if (cell.owner === Player.HUMAN) {
            playerPower += cell.power;
          } else if (cell.owner === Player.AI) {
            aiPower += cell.power;
          }
        });
      } else {
        // Column
        const col = line - BOARD_SIZE;
        for (let row = 0; row < BOARD_SIZE; row++) {
          const cell = this.gameState.board[row][col];
          if (cell.owner === Player.HUMAN) {
            playerPower += cell.power;
          } else if (cell.owner === Player.AI) {
            aiPower += cell.power;
          }
        }
      }
    });

    return { player: playerPower, ai: aiPower };
  }

  private clearCompletedLines(completedLines: number[]): void {
    completedLines.forEach((line) => {
      if (line < BOARD_SIZE) {
        // Clear row
        for (let col = 0; col < BOARD_SIZE; col++) {
          this.gameState.board[line][col] = { power: 0, owner: null };
        }
      } else {
        // Clear column
        const col = line - BOARD_SIZE;
        for (let row = 0; row < BOARD_SIZE; row++) {
          this.gameState.board[row][col] = { power: 0, owner: null };
        }
      }
    });
  }

  private applyDamage(powerScores: { player: number; ai: number }): void {
    const completedLinesCount = 1; // For simplicity, apply 1 damage per completed line event

    if (powerScores.player < powerScores.ai) {
      this.gameState.playerHp -= completedLinesCount;
    } else if (powerScores.ai < powerScores.player) {
      this.gameState.aiHp -= completedLinesCount;
    }
    // No damage if tied

    // Check for game over
    if (this.gameState.playerHp <= 0 || this.gameState.aiHp <= 0) {
      this.gameState.gameOver = true;
      if (this.gameState.playerHp <= 0 && this.gameState.aiHp <= 0) {
        // Tie, determine winner by total power on board
        const boardPower = this.calculateTotalBoardPower();
        this.gameState.winner =
          boardPower.player > boardPower.ai ? Player.HUMAN : Player.AI;
      } else {
        this.gameState.winner =
          this.gameState.playerHp > 0 ? Player.HUMAN : Player.AI;
      }
    }
  }

  private calculateTotalBoardPower(): { player: number; ai: number } {
    let playerPower = 0;
    let aiPower = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = this.gameState.board[row][col];
        if (cell.owner === Player.HUMAN) {
          playerPower += cell.power;
        } else if (cell.owner === Player.AI) {
          aiPower += cell.power;
        }
      }
    }

    return { player: playerPower, ai: aiPower };
  }

  public nextTurn(): void {
    if (this.gameState.gameOver) return;

    this.gameState.currentPlayer =
      this.gameState.currentPlayer === Player.HUMAN ? Player.AI : Player.HUMAN;

    // Generate new bricks for the next player
    if (this.gameState.currentPlayer === Player.HUMAN) {
      this.gameState.playerBricks = this.generateRandomBricks(Player.HUMAN);
    } else {
      this.gameState.aiBricks = this.generateRandomBricks(Player.AI);
    }
  }

  public canMakeAnyMove(player: Player): boolean {
    const bricks =
      player === Player.HUMAN
        ? this.gameState.playerBricks
        : this.gameState.aiBricks;

    for (const brick of bricks) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (this.canPlaceBrick(brick, row, col)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public checkGameEnd(): void {
    if (this.gameState.gameOver) return;

    const currentPlayerCanMove = this.canMakeAnyMove(
      this.gameState.currentPlayer,
    );
    const otherPlayer =
      this.gameState.currentPlayer === Player.HUMAN ? Player.AI : Player.HUMAN;
    const otherPlayerCanMove = this.canMakeAnyMove(otherPlayer);

    if (!currentPlayerCanMove && !otherPlayerCanMove) {
      this.gameState.gameOver = true;
      const boardPower = this.calculateTotalBoardPower();
      if (this.gameState.playerHp === this.gameState.aiHp) {
        this.gameState.winner =
          boardPower.player > boardPower.ai ? Player.HUMAN : Player.AI;
      } else {
        this.gameState.winner =
          this.gameState.playerHp > this.gameState.aiHp
            ? Player.HUMAN
            : Player.AI;
      }
    }
  }
}
