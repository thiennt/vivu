import { Container, Assets, Text, Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { COLORS } from "../app";

export class Menu extends Container {
  private heroButton!: FancyButton;
  private inventoryButton!: FancyButton;
  private collectionButton!: FancyButton;
  private dungeonButton!: FancyButton;
  private formationButton!: FancyButton;

  constructor() {
    super();

    this.createMenuButtons();
  }

  private createMenuButtons() {
    // Character/Player Detail Button
    this.heroButton = this.createMenuButton("Character", Assets.get("home"));
    this.heroButton.onPress.connect(() => {
      // navigation.showScreen(CharacterScreen);
      console.log("Character screen coming soon!");
    });
    this.addChild(this.heroButton);

    // Characters Collection Button  
    this.collectionButton = this.createMenuButton("Collection", Assets.get("inventory"));
    this.collectionButton.onPress.connect(() => {
      // navigation.showScreen(HeroCollectionScreen);
      console.log("Collection screen coming soon!");
    });
    this.addChild(this.collectionButton);

    // Dungeon Button
    this.dungeonButton = this.createMenuButton("Dungeon", Assets.get("dungeon"));
    this.dungeonButton.onPress.connect(() => {
      // navigation.showScreen(DungeonScreen);
      console.log("Dungeon screen coming soon!");
    });
    this.addChild(this.dungeonButton);

    // Formation Button
    this.formationButton = this.createMenuButton("Formation", Assets.get("plus"));
    this.formationButton.onPress.connect(() => {
      // navigation.showScreen(FormationScreen);
      console.log("Formation screen coming soon!");
    });
    this.addChild(this.formationButton);

    // Inventory placeholder (not in requirements but mentioned in assets)
    this.inventoryButton = this.createMenuButton("Inventory", Assets.get("inventory"));
    this.inventoryButton.onPress.connect(() => {
      console.log("Inventory screen not in requirements");
    });
    this.addChild(this.inventoryButton);
  }

  private createMenuButton(text: string, iconTexture: any): FancyButton {
    const button = new FancyButton();

    // Create whimsical button background with rounded corners
    const graphic = new Graphics();
    graphic.roundRect(0, 0, 200, 50, 10);
    graphic.fill(COLORS.dustyBlue);
    graphic.stroke({ width: 3, color: COLORS.deepMagenta });

    button.defaultView = graphic;

    // Hover state
    const hoverGraphic = new Graphics();
    hoverGraphic.roundRect(0, 0, 200, 50, 10);
    hoverGraphic.fill(COLORS.buttonHover);
    hoverGraphic.stroke({ width: 3, color: COLORS.goldAccent });
    button.hoverView = hoverGraphic;

    // Icon
    if (iconTexture) {
      button.iconView = iconTexture;
      button.defaultIconScale = 0.8;
      button.defaultIconAnchor = { x: 0.5, y: 0.5 };
      button.iconOffset = { x: -60, y: 0 };
    }

    // Text with fantasy style
    button.textView = new Text({
      text,
      style: {
        fill: COLORS.warmCream,
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
        dropShadow: {
          alpha: 0.7,
          angle: 45,
          blur: 2,
          color: COLORS.shadowGray,
          distance: 2,
        },
      },
    });
    button.defaultTextScale = 1;
    button.defaultTextAnchor = { x: 0.5, y: 0.5 };
    button.textOffset = { x: 20, y: 0 };

    button.padding = 10;
    button.anchor.set(0.5, 0.5);

    return button;
  }

  public resize(width: number, height: number) {
    const buttonSpacing = 70;
    const startY = (height - (5 * buttonSpacing)) / 2;

    this.heroButton.x = width / 2;
    this.heroButton.y = startY;

    this.collectionButton.x = width / 2;
    this.collectionButton.y = startY + buttonSpacing;

    this.dungeonButton.x = width / 2;
    this.dungeonButton.y = startY + buttonSpacing * 2;

    this.formationButton.x = width / 2;
    this.formationButton.y = startY + buttonSpacing * 3;

    this.inventoryButton.x = width / 2;
    this.inventoryButton.y = startY + buttonSpacing * 4;
  }

  public show() {
    // Add any show animations here if needed
  }
}