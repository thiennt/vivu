import { Container, Ticker, Sprite, Assets } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";


export class HomeScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  constructor() {
    super();
  }

  public prepare() {}

  public async show() {
  }

  public resize(width: number, height: number) {
  }

  public update(time: Ticker) {}
}
