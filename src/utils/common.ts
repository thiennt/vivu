import { Texture } from "pixi.js";

export type AnimationSet = {
    idle?: Texture[];
    fight?: Texture[];
    strike?: Texture[];
    crit?: Texture[];
    run?: Texture[];
};

export type Stats = {
    'hp': number;
    'maxHp': number;
    'atk': number;
    'def': number;
    'crit': number;
    'agi': number;
};

// Player data structure for API response
export interface PlayerData {
    id: number;
    name: string;
    level: number;
    exp: number;
    maxExp: number;
    class: string;
    avatar: string;
    stats: {
        str: number;
        int: number;
        con: number;
        agi: number;
        hp: number;
        atk: number;
        mag: number;
        def: number;
        luck: number;
        hitRate: number;
        dodgeRate: number;
    };
    pointsToSpend: number;
}


export function testForAABB(object1: any, object2: any): boolean {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return (bounds1.x >= bounds2.x);

    // return (
    //     bounds1.x < bounds2.x + bounds2.width &&
    //     bounds1.x + bounds1.width > bounds2.x &&
    //     bounds1.y < bounds2.y + bounds2.height &&
    //     bounds1.y + bounds1.height > bounds2.y
}

export function getRandomItemByRate(items: any[]): { key: string, value: any } | null {
    const totalRate = Object.values(items).reduce((sum, item) => sum + item.rate, 0);
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