import { Brick, Player } from "./types";
import { BlocklastLogic } from "./BlocklastLogic";

export class AIPlayer {
  private logic: BlocklastLogic;

  constructor(logic: BlocklastLogic) {
    this.logic = logic;
  }

  public selectAndPlaceBrick(): {
    brickIndex: number;
    row: number;
    col: number;
  } | null {
    const gameState = this.logic.getGameState();

    if (gameState.currentPlayer !== Player.AI || gameState.gameOver) {
      return null;
    }

    const availableBricks = gameState.aiBricks;

    // Try each brick and find the best placement
    let bestMove: {
      brickIndex: number;
      row: number;
      col: number;
      score: number;
    } | null = null;

    for (
      let brickIndex = 0;
      brickIndex < availableBricks.length;
      brickIndex++
    ) {
      const brick = availableBricks[brickIndex];

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (this.logic.canPlaceBrick(brick, row, col)) {
            const score = this.evaluatePlacement(brick, row, col);

            if (bestMove === null || score > bestMove.score) {
              bestMove = { brickIndex, row, col, score };
            }
          }
        }
      }
    }

    if (bestMove) {
      return {
        brickIndex: bestMove.brickIndex,
        row: bestMove.row,
        col: bestMove.col,
      };
    }

    return null;
  }

  private evaluatePlacement(brick: Brick, row: number, col: number): number {
    let score = 0;
    const gameState = this.logic.getGameState();

    // Create a temporary copy to simulate the placement
    const tempBoard = gameState.board.map((row) =>
      row.map((cell) => ({ ...cell })),
    );

    // Place brick on temp board
    brick.cells.forEach((cell) => {
      const boardRow = row + cell.localRow;
      const boardCol = col + cell.localCol;
      if (boardRow >= 0 && boardRow < 8 && boardCol >= 0 && boardCol < 8) {
        tempBoard[boardRow][boardCol] = {
          power: cell.power,
          owner: Player.AI,
        };
      }
    });

    // Check for potential line completions
    score += this.scoreLineCompletions(tempBoard) * 10;

    // Prefer placing near existing AI pieces
    score += this.scoreProximityToAIPieces(tempBoard, row, col, brick) * 2;

    // Prefer higher power values
    score += brick.cells.reduce((sum, cell) => sum + cell.power, 0);

    // Prefer center positions slightly
    const centerRow = 4;
    const centerCol = 4;
    const distanceFromCenter =
      Math.abs(row - centerRow) + Math.abs(col - centerCol);
    score += Math.max(0, 8 - distanceFromCenter);

    return score;
  }

  private scoreLineCompletions(board: any[][]): number {
    let score = 0;

    // Check rows for completion potential
    for (let row = 0; row < 8; row++) {
      const aiCells = board[row].filter(
        (cell) => cell.owner === Player.AI,
      ).length;
      const humanCells = board[row].filter(
        (cell) => cell.owner === Player.HUMAN,
      ).length;
      const emptyCells = 8 - aiCells - humanCells;

      if (emptyCells === 0) {
        // Complete line - major bonus if AI dominates
        if (aiCells > humanCells) {
          score += 100;
        } else if (aiCells < humanCells) {
          score -= 50; // Avoid completing lines where human dominates
        }
      } else if (emptyCells <= 2) {
        // Near completion
        score += aiCells * 5;
      }
    }

    // Check columns for completion potential
    for (let col = 0; col < 8; col++) {
      const aiCells = board
        .map((row) => row[col])
        .filter((cell) => cell.owner === Player.AI).length;
      const humanCells = board
        .map((row) => row[col])
        .filter((cell) => cell.owner === Player.HUMAN).length;
      const emptyCells = 8 - aiCells - humanCells;

      if (emptyCells === 0) {
        // Complete line - major bonus if AI dominates
        if (aiCells > humanCells) {
          score += 100;
        } else if (aiCells < humanCells) {
          score -= 50;
        }
      } else if (emptyCells <= 2) {
        // Near completion
        score += aiCells * 5;
      }
    }

    return score;
  }

  private scoreProximityToAIPieces(
    board: any[][],
    row: number,
    col: number,
    brick: Brick,
  ): number {
    let score = 0;

    brick.cells.forEach((cell) => {
      const boardRow = row + cell.localRow;
      const boardCol = col + cell.localCol;

      if (boardRow >= 0 && boardRow < 8 && boardCol >= 0 && boardCol < 8) {
        // Check adjacent cells for AI pieces
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            const adjRow = boardRow + dr;
            const adjCol = boardCol + dc;

            if (adjRow >= 0 && adjRow < 8 && adjCol >= 0 && adjCol < 8) {
              if (board[adjRow][adjCol].owner === Player.AI) {
                score += 3;
              }
            }
          }
        }
      }
    });

    return score;
  }
}
