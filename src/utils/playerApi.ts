import { PlayerData } from "./common";

/**
 * Mock player data for development
 */
const mockPlayerData: PlayerData = {
  player: {
    character_id: "crypto_warrior_001",
    farcaster_id: "fc_001",
    username: "CryptoWarrior",
    sta: 15,
    str: 20,
    agi: 12,
    luck: 8,
    level: 25,
    exp: 1250,
    awaking: 3,
    star: 4,
    points: 5,
    character: {
      id: "crypto_warrior_001",
      name: "Bitcoin Knight",
      avatar_url: "stickman_1.png",
      description: "A legendary warrior forged in the fires of blockchain",
      c_type: "warrior",
      hp: 180,
      atk: 75,
      def: 60,
      agi: 45,
      crit_rate: 15,
      crit_dmg: 150,
      res: 25,
      damage: 85,
      mitigation: 20,
      hit_rate: 88,
      dodge: 12,
      level: 25,
      exp: 1250,
    }
  },
  characters: [
    {
      id: "crypto_warrior_001",
      name: "Bitcoin Knight",
      avatar_url: "stickman_1.png",
      description: "A legendary warrior forged in the fires of blockchain",
      c_type: "warrior",
      hp: 180,
      atk: 75,
      def: 60,
      agi: 45,
      crit_rate: 15,
      crit_dmg: 150,
      res: 25,
      damage: 85,
      mitigation: 20,
      hit_rate: 88,
      dodge: 12,
      level: 25,
      exp: 1250,
    }
  ]
};

/**
 * Fetch player data from API
 * TODO: Replace with actual API call when server is available
 * @param playerId - The player ID to fetch (currently uses mock data)
 * @returns Promise<PlayerData>
 */
export async function fetchPlayerData(
  playerId: string = "player_fc_001",
): Promise<PlayerData> {
  try {
    // Try to fetch from API first
    const response = await fetch(`http://localhost:3000/players/${playerId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetch response:", data);
    return data;
  } catch (error) {
    console.warn("API not available, using mock data:", error);
    // Return mock data as fallback
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    return mockPlayerData;
  }
}

/**
 * Get the current player ID
 * TODO: This should be configurable or come from authentication/session
 * @returns string - The player ID
 */
export function getCurrentPlayerId(): string {
  // TODO: Get from config, session, or authentication
  // For now, use the first seeded player ID
  return "player_fc_001";
}
