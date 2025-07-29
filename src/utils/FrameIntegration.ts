/**
 * Farcaster Frame integration module
 * Handles communication between the PixiJS game and Frame API
 */

export class FrameIntegration {
  private gameId: string;
  private isFrameContext: boolean;
  private gameStateApi: string;

  constructor() {
    this.gameId = this.getGameIdFromUrl() || "default";
    this.isFrameContext = this.detectFrameContext();
    this.gameStateApi = "/api/game/state";
  }

  /**
   * Detect if running in Frame context
   */
  private detectFrameContext(): boolean {
    // Check for Frame-specific parameters or user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const url = window.location.href;

    return (
      url.includes("gameId=") ||
      userAgent.includes("farcaster") ||
      userAgent.includes("warpcast") ||
      window.location.search.includes("frame=true")
    );
  }

  /**
   * Get game ID from URL parameters
   */
  private getGameIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("gameId");
  }

  /**
   * Check if currently in Frame context
   */
  public isFrame(): boolean {
    return this.isFrameContext;
  }

  /**
   * Get current game ID
   */
  public getGameId(): string {
    return this.gameId;
  }

  /**
   * Load game state from Frame API
   */
  public async loadGameState(): Promise<any> {
    try {
      const response = await fetch(`${this.gameStateApi}/${this.gameId}`);
      const gameState = await response.json();
      return gameState;
    } catch (error) {
      console.warn("Failed to load game state from Frame API:", error);
      return null;
    }
  }

  /**
   * Save game state to Frame API
   */
  public async saveGameState(gameState: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.gameStateApi}/${this.gameId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameState),
      });

      return response.ok;
    } catch (error) {
      console.warn("Failed to save game state to Frame API:", error);
      return false;
    }
  }

  /**
   * Sync PixiJS game state with Frame state
   */
  public async syncWithFrame(pixiGameState: any): Promise<any> {
    if (!this.isFrameContext) {
      return pixiGameState; // No sync needed if not in Frame
    }

    const frameState = await this.loadGameState();
    if (!frameState) {
      return pixiGameState; // Use PixiJS state if Frame state unavailable
    }

    // Merge Frame state with PixiJS state, prioritizing Frame state for combat stats
    return {
      ...pixiGameState,
      playerHp: frameState.playerHp,
      playerMaxHp: frameState.playerMaxHp,
      enemyHp: frameState.enemyHp,
      enemyMaxHp: frameState.enemyMaxHp,
      playerStats: frameState.playerStats,
      enemyStats: frameState.enemyStats,
      turn: frameState.turn,
      gameOver: frameState.gameOver,
      winner: frameState.winner,
      lastAction: frameState.lastAction,
    };
  }

  /**
   * Update Frame state with PixiJS game changes
   */
  public async updateFrame(pixiGameState: any): Promise<void> {
    if (!this.isFrameContext) {
      return; // No update needed if not in Frame
    }

    await this.saveGameState(pixiGameState);
  }

  /**
   * Get Frame-appropriate button actions
   */
  public getFrameActions(): string[] {
    return ["⚔️ Attack", "🛡️ Defend", "💨 Special", "🔄 Reset"];
  }

  /**
   * Show Frame integration info
   */
  public showFrameInfo(): void {
    if (this.isFrameContext) {
      console.log(`🎮 Frame Integration Active - Game ID: ${this.gameId}`);

      // Add visual indicator for Frame context
      const frameIndicator = document.createElement("div");
      frameIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #007BFF;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                z-index: 1000;
            `;
      frameIndicator.textContent = "🎮 Frame Mode";
      document.body.appendChild(frameIndicator);
    }
  }
}
