export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function testForAABB(object1, object2) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return (bounds1.x >= bounds2.x);

    // return (
    //     bounds1.x < bounds2.x + bounds2.width &&
    //     bounds1.x + bounds1.width > bounds2.x &&
    //     bounds1.y < bounds2.y + bounds2.height &&
    //     bounds1.y + bounds1.height > bounds2.y
}

export function getRandomItem(items) {
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