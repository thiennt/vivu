import { Container, Ticker } from "pixi.js";
import { BlocklastScene } from "../ui/BlocklastScene";

export class BlocklastScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private blocklastScene: BlocklastScene;

  constructor() {
    super();

    this.blocklastScene = new BlocklastScene();
    this.addChild(this.blocklastScene);
  }

  public prepare(): void {
    // Prepare the scene if needed
  }

  public async show(): Promise<void> {
    await this.blocklastScene.show();
  }

  public async hide(): Promise<void> {
    await this.blocklastScene.hide();
  }

  public resize(width: number, height: number): void {
    this.blocklastScene.resize(width, height);
  }

  public update(time: Ticker): void {
    this.blocklastScene.update(time);
  }
}
