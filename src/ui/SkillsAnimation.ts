import { Assets, Sprite } from "pixi.js";

const createAnimation = (options: {
  assetName: string;
  x?: number;
  y?: number;
  direction?: "up" | "down";
  scale?: number;
}): Sprite => {
  const sprite = new Sprite(Assets.get(options.assetName));
  sprite.anchor.set(0.5);
  sprite.scale.set(options.scale || 1);
  sprite.x = options.x || 0;
  sprite.y = options.y || 0;

  if (options.direction === "down") {
    sprite.scale.y = -1;
  }

  return sprite;
};

export const slashAnimation = (options: {
  x: number;
  y: number;
  direction: "up" | "down";
  scale: number;
}): Sprite => {
  return createAnimation({ assetName: "slash_4", ...options });
};

export const fireAnimation = (options: {
  x: number;
  y: number;
  direction: "up" | "down";
  scale: number;
}): Sprite => {
  return createAnimation({ assetName: "fire", ...options });
};

export const windAnimation = (options: {
  x: number;
  y: number;
  direction: "up" | "down";
  scale: number;
}): Sprite => {
  return createAnimation({ assetName: "wind", ...options });
};

export const thunderAnimation = (options: {
  x: number;
  y: number;
  direction: "up" | "down";
  scale: number;
}): Sprite => {
  return createAnimation({ assetName: "thunder", ...options });
};
