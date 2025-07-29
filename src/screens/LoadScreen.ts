import { Container, Assets, AnimatedSprite } from "pixi.js";
import gsap from "gsap";
import { app } from "../app";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["preload"];

  /** LThe loading message display */
  private loading: AnimatedSprite;

  constructor() {
    super();

    const loadingSheet = Assets.get("loading");
    loadingSheet.animations.load = [
      loadingSheet.textures.loading_1,
      loadingSheet.textures.loading_2,
      loadingSheet.textures.loading_3,
    ];
    this.loading = new AnimatedSprite(loadingSheet.animations.load);
    this.loading.anchor.set(0.5);
    // this.loading.width = 180;
    // this.loading.height = 40;
    //this.loading.tint = 0x262626;
    //this.loading.alpha = 0.2;
    this.loading.animationSpeed = 0.1;
    this.loading.play();
    this.loading.y = app.screen.height / 2;
    this.loading.x = app.screen.width / 2;
    //this.loading.visible = true;
    this.addChild(this.loading);
  }

  /** Show screen with animations */
  public async show() {
    gsap.killTweensOf(this.loading);
  }

  /** Hide screen with animations */
  public async hide() {
    // Change then hide the loading message
    gsap.killTweensOf(this.loading);
    gsap.to(this.loading, {
      alpha: 0,
      duration: 0.3,
      ease: "linear",
      delay: 0.5,
    });
  }
}
