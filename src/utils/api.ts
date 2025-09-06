import { StageData } from "./common";

export async function fetchStagesByPlayer(
  playerId: string = "mystic_fc_003",
): Promise<StageData> {
  try {
    const response = await fetch(
      `http://localhost:3000/players/${playerId}/stages`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetch response:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw new Error("Failed to load data");
  }
}
