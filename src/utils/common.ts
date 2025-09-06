import { Texture } from "pixi.js";

export type AnimationSet = {
  idle?: Texture[];
  fight?: Texture[];
  strike?: Texture[];
  crit?: Texture[];
  run?: Texture[];
};

export type Player = {
  character_id: string;
  farcaster_id: string;
  username: string;
  sta: number;
  str: number;
  agi: number;
  luck: number;
  level: number;
  exp: number;
  awaking: number;
  star: number;
  points: number;
  character: Character;
};

export type Character = {
  id: string;
  name: string;
  avatar_url: string;
  description?: string;
  c_type: string;
  hp: number;
  atk: number;
  def: number;
  agi: number;
  crit_rate: number;
  crit_dmg: number;
  res: number;
  damage: number;
  mitigation: number;
  hit_rate: number;
  dodge: number;
  level: number | null;
  exp: number | null;
};

// Player data structure for API response
export interface PlayerData {
  player: Player;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  background_url: string;
  music_url?: string;
}

export interface StageData {
  stages: Stage[];
  completedStageIds: string[];
}

export function testForAABB(object1: any, object2: any): boolean {
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return bounds1.x >= bounds2.x;

  // return (
  //     bounds1.x < bounds2.x + bounds2.width &&
  //     bounds1.x + bounds1.width > bounds2.x &&
  //     bounds1.y < bounds2.y + bounds2.height &&
  //     bounds1.y + bounds1.height > bounds2.y
}

export function getRandomItemByRate(
  items: any[],
): { key: string; value: any } | null {
  const totalRate = Object.values(items).reduce(
    (sum, item) => sum + item.rate,
    0,
  );
  let randomValue = Math.random() * totalRate;

  for (const [key, item] of Object.entries(items)) {
    if (randomValue < item.rate) {
      return { key, value: item.value };
    }
    randomValue -= item.rate;
  }

  return null; // In case no item is selected, though this should not happen with correct rates.
}

export function getRandomItems(arr: any[], count: number): any[] {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}
