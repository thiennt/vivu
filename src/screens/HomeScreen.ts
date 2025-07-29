import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { Menu } from "../ui/Menu";
import { BattleScene } from "../ui/BattleScene";

export class HomeScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private menu: Menu;
  private battleScene: BattleScene;

  constructor() {
    super();

    this.menu = new Menu();
    this.addChild(this.menu);

    this.battleScene = new BattleScene();
    this.addChild(this.battleScene);
  }

  public prepare() {
    this.battleScene.prepare();
  }

  public async show() {
    this.menu.show();

    this.battleScene.show();
  }

  public resize(width: number, height: number) {
    this.menu.resize(width, height);

    this.battleScene.x = 0;
    this.battleScene.y = this.menu.y;
    this.battleScene.resize(width, height);
  }

  public update(time: Ticker) {
    this.battleScene.update(time);
  }
}
