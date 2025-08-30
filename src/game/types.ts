export interface Position {
    row: number;
    col: number;
}

export interface Cell {
    power: number;
    owner: Player | null;
}

export enum Player {
    HUMAN = 'human',
    AI = 'ai'
}

export enum BrickType {
    L = 'L',
    I = 'I',
    T = 'T',
    O = 'O',
    S = 'S',
    Z = 'Z',
    J = 'J'
}

export interface BrickCell {
    power: number;
    localRow: number;
    localCol: number;
}

export interface Brick {
    type: BrickType;
    cells: BrickCell[];
    owner: Player;
}

export interface GameState {
    board: Cell[][];
    playerHp: number;
    aiHp: number;
    currentPlayer: Player;
    playerBricks: Brick[];
    aiBricks: Brick[];
    gameOver: boolean;
    winner: Player | null;
}

export interface PlacementResult {
    success: boolean;
    completedLines?: number[];
    powerScores?: { player: number; ai: number };
}

export const BOARD_SIZE = 8;
export const INITIAL_HP = 20;
export const BRICKS_PER_TURN = 3;