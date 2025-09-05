import { PlayerData } from './common';

// Mock player data for testing since no actual API server exists
const mockPlayerData: PlayerData = {
    id: 1,
    name: "Hero Adventurer",
    level: 15,
    exp: 1250,
    maxExp: 2000,
    class: "WARRIOR",
    avatar: "avatar", // Using existing avatar asset
    stats: {
        str: 15,
        int: 10,
        con: 12,
        agi: 11,
        hp: 250,
        atk: 60,
        mag: 40,
        def: 32,
        luck: 5,
        hitRate: 98,
        dodgeRate: 7
    },
    pointsToSpend: 4
};

/**
 * Fetch player data from API
 * TODO: Replace with actual API call when server is available
 * @param playerId - The player ID to fetch (currently uses mock data)
 * @returns Promise<PlayerData>
 */
export async function fetchPlayerData(playerId: number = 1): Promise<PlayerData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
        // TODO: Replace with actual API call to http://localhost:3000/players/${playerId}
        // const response = await fetch(`http://localhost:3000/players/${playerId}`);
        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // return await response.json();
        
        // For now, return mock data
        return { ...mockPlayerData, id: playerId };
    } catch (error) {
        console.error('Failed to fetch player data:', error);
        throw new Error('Failed to load player data');
    }
}

/**
 * Get the current player ID
 * TODO: This should be configurable or come from authentication/session
 * @returns number - The player ID
 */
export function getCurrentPlayerId(): number {
    // TODO: Get from config, session, or authentication
    // For now, use the first seeded player ID
    return 1;
}