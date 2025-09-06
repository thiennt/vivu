import { PlayerData } from "./common";

/**
 * Fetch player data from API
 * TODO: Replace with actual API call when server is available
 * @param playerId - The player ID to fetch (currently uses mock data)
 * @returns Promise<PlayerData>
 */
export async function fetchPlayerData(
  playerId: string = "mystic_fc_003",
): Promise<PlayerData> {
  try {
    // TODO: Replace with actual API call to http://localhost:3000/players/${playerId}
    const response = await fetch(`http://localhost:3000/players/${playerId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetch response:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch player data:", error);
    throw new Error("Failed to load player data");
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
  return "mystic_fc_003";
}
