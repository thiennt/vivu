import { Container, Ticker, Sprite, Assets, Graphics } from "pixi.js";
import gsap from "gsap";
import { waitFor } from "../utils/asyncUtils";
import { Menu } from "../ui/Menu";
import { COLORS } from "../app";

export class HomeScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background?: Sprite;
  private menu!: Menu;
  private titleContainer!: Container;

  constructor() {
    super();

    this.createBackground();
    this.createTitle();
    this.createMenu();
  }

  private createBackground() {
    this.background = new Sprite(Assets.get("background"));
    if (!this.background.texture || this.background.texture.label === "EMPTY") {
      // Fallback: create a solid magical background
      const bg = new Graphics();
      bg.rect(0, 0, 800, 600);
      bg.fill(COLORS.darkBg);
      this.addChild(bg);
    } else {
      this.addChild(this.background);
    }
  }

  private createTitle() {
    this.titleContainer = new Container();
    
    // Create magical title styling
    const titleBg = new Graphics();
    titleBg.roundRect(0, 0, 300, 80, 15);
    titleBg.fill(COLORS.deepMagenta);
    titleBg.stroke({ width: 4, color: COLORS.goldAccent });
    this.titleContainer.addChild(titleBg);

    // Add some decorative elements
    const leftStar = new Graphics();
    leftStar.star(0, 0, 5, 15, 8);
    leftStar.fill(COLORS.goldAccent);
    leftStar.x = -20;
    leftStar.y = 40;
    this.titleContainer.addChild(leftStar);

    const rightStar = new Graphics();
    rightStar.star(0, 0, 5, 15, 8);
    rightStar.fill(COLORS.goldAccent);
    rightStar.x = 320;
    rightStar.y = 40;
    this.titleContainer.addChild(rightStar);

    this.addChild(this.titleContainer);
  }

  private createMenu() {
    this.menu = new Menu();
    this.addChild(this.menu);
  }

  public prepare() {
    // Any preparation logic
  }

  public async show() {
    // Animate title entrance
    this.titleContainer.scale.set(0);
    this.titleContainer.alpha = 0;
    
    gsap.to(this.titleContainer.scale, { 
      x: 1, y: 1, 
      duration: 0.8, 
      ease: "back.out(1.7)" 
    });
    gsap.to(this.titleContainer, { 
      alpha: 1, 
      duration: 0.5 
    });

    // Show menu with slight delay
    await waitFor(0.3);
    this.menu.show();
  }

  public resize(width: number, height: number) {
    // Resize background
    if (this.background) {
      this.background.width = width;
      this.background.height = height;
    } else if (this.children[0] instanceof Graphics) {
      // Resize fallback background
      this.children[0].clear();
      (this.children[0] as Graphics).rect(0, 0, width, height);
      (this.children[0] as Graphics).fill(COLORS.darkBg);
    }

    // Position title
    this.titleContainer.x = (width - 300) / 2;
    this.titleContainer.y = 50;

    // Resize menu
    this.menu.resize(width, height);
  }

  public update(_time: Ticker) {
    // Add any continuous animations here if needed
  }
}
