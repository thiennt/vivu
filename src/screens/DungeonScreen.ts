import { Container, Ticker } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { navigation } from "../utils/navigation";

import { Menu } from "../ui/Menu";
import { CombatScene } from "../ui/CombatScene";

export class DungeonScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private menu: Menu;
  private combatScene: CombatScene;

  constructor() {
    super();

    this.menu = new Menu();
    this.addChild(this.menu);

    this.combatScene = new CombatScene();
    this.addChild(this.combatScene);
  }

  public prepare() {
    this.combatScene.prepare();
  }

  public async show() {
    this.menu.show();

    this.combatScene.show();
  }

  public resize(width: number, height: number) {
    this.menu.resize(width, height);

    this.combatScene.x = 0;
    this.combatScene.y = this.menu.y;
    this.combatScene.resize(width, height);
  }

  public update(time: Ticker) {
    this.combatScene.update(time);
  }
}
