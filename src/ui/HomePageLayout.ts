import { Container, Assets, Sprite, Text, Graphics } from "pixi.js";
import gsap from "gsap";

export class HomePageLayout extends Container {
  private background!: Sprite;
  private topBar!: Container;
  private locationMarkers!: Container;
  private characterAvatar!: Sprite;
  private locationIcons: Sprite[] = [];

  constructor() {
    super();

    this.createBackground();
    this.createTopBar();
    this.createLocationMarkers();
    this.createCharacterAvatar();
  }

  private createBackground() {
    this.background = new Sprite(Assets.get("medieval_map_background"));
    this.addChild(this.background);
  }

  private createTopBar() {
    this.topBar = new Container();
    this.addChild(this.topBar);

    // Top bar background
    const topBg = new Graphics();
    topBg.roundRect(0, 0, 800, 60, 8);
    topBg.fill(0x8b4513); // Saddle brown
    topBg.stroke({ width: 2, color: 0xffd700 }); // Gold border
    this.topBar.addChild(topBg);

    // Level text
    const levelText = new Text("LEVEL 3", {
      fontFamily: "Arial",
      fontSize: 18,
      fontWeight: "bold",
      fill: "#FFD700",
    });
    levelText.x = 20;
    levelText.y = 20;
    this.topBar.addChild(levelText);

    // Coin icon and count
    const coinIcon = new Sprite(Assets.get("coin_icon"));
    coinIcon.width = 24;
    coinIcon.height = 24;
    coinIcon.x = 150;
    coinIcon.y = 18;
    this.topBar.addChild(coinIcon);

    const coinText = new Text("5", {
      fontFamily: "Arial",
      fontSize: 16,
      fontWeight: "bold",
      fill: "#FFD700",
    });
    coinText.x = 180;
    coinText.y = 22;
    this.topBar.addChild(coinText);

    // XP Progress bar
    const xpBg = new Graphics();
    xpBg.roundRect(250, 25, 200, 10, 5);
    xpBg.fill(0x444444);
    this.topBar.addChild(xpBg);

    const xpFill = new Graphics();
    xpFill.roundRect(250, 25, 10, 10, 5); // Very small progress (0/17)
    xpFill.fill(0x00ff00);
    this.topBar.addChild(xpFill);

    const xpText = new Text("XP: 0 / 17", {
      fontFamily: "Arial",
      fontSize: 12,
      fill: "#FFFFFF",
    });
    xpText.x = 470;
    xpText.y = 22;
    this.topBar.addChild(xpText);

    // Home icon (right side)
    const homeIcon = new Sprite(Assets.get("home"));
    homeIcon.width = 32;
    homeIcon.height = 32;
    homeIcon.x = 750;
    homeIcon.y = 14;
    this.topBar.addChild(homeIcon);
  }

  private createLocationMarkers() {
    this.locationMarkers = new Container();
    this.addChild(this.locationMarkers);

    const locations = [
      { name: "Market", icon: "market_icon", x: 0.25, y: 0.3 },
      { name: "Dungeons", icon: "dungeons_icon", x: 0.5, y: 0.25 },
      { name: "Equipment", icon: "equipment_icon", x: 0.2, y: 0.7 },
      { name: "Skills", icon: "skills_icon", x: 0.75, y: 0.6 },
      { name: "???", icon: "mystery_icon", x: 0.5, y: 0.55 },
    ];

    locations.forEach((location) => {
      this.createLocationMarker(location);
    });
  }

  private createLocationMarker(location: {
    name: string;
    icon: string;
    x: number;
    y: number;
  }) {
    const locationContainer = new Container();

    // Location icon
    const icon = new Sprite(Assets.get(location.icon));
    icon.anchor.set(0.5);
    icon.width = 80;
    icon.height = 80;
    locationContainer.addChild(icon);
    this.locationIcons.push(icon);

    // Label background
    const labelBg = new Graphics();
    labelBg.roundRect(-40, 50, 80, 25, 12);
    labelBg.fill(0x000000);
    labelBg.alpha = 0.8;
    labelBg.stroke({ width: 1, color: 0xffd700 });
    locationContainer.addChild(labelBg);

    // Label text
    const labelText = new Text(location.name, {
      fontFamily: "Arial",
      fontSize: 14,
      fontWeight: "bold",
      fill: "#FFFFFF",
      align: "center",
    });
    labelText.anchor.set(0.5);
    labelText.x = 0;
    labelText.y = 62;
    locationContainer.addChild(labelText);

    // Store relative position for layout
    (locationContainer as any).userData = {
      relativeX: location.x,
      relativeY: location.y,
    };

    // Make interactive
    locationContainer.interactive = true;
    locationContainer.cursor = "pointer";

    // Hover effects
    locationContainer.on("pointerover", () => {
      gsap.to(locationContainer.scale, { x: 1.1, y: 1.1, duration: 0.2 });
      gsap.to(icon, { rotation: icon.rotation + 0.1, duration: 0.2 });
    });

    locationContainer.on("pointerout", () => {
      gsap.to(locationContainer.scale, { x: 1, y: 1, duration: 0.2 });
      gsap.to(icon, { rotation: 0, duration: 0.2 });
    });

    locationContainer.on("pointerdown", () => {
      console.log(`Selected location: ${location.name}`);

      // Add visual feedback
      gsap.to(locationContainer.scale, {
        x: 0.9,
        y: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      // Handle navigation based on location
      if (location.name === "Dungeons") {
        // This would navigate to dungeon screen
        console.log("Navigate to dungeons");
      }
    });

    this.locationMarkers.addChild(locationContainer);
  }

  private createCharacterAvatar() {
    this.characterAvatar = new Sprite(Assets.get("character_avatar"));
    this.characterAvatar.anchor.set(0.5, 1); // Bottom center anchor
    this.characterAvatar.width = 120;
    this.characterAvatar.height = 120;
    this.addChild(this.characterAvatar);
  }

  public show() {
    // Animate location markers entrance
    this.locationMarkers.children.forEach((location, index) => {
      location.alpha = 0;
      location.scale.set(0.5);

      gsap.to(location, {
        alpha: 1,
        duration: 0.6,
        delay: index * 0.15,
        ease: "back.out(1.7)",
      });

      gsap.to(location.scale, {
        x: 1,
        y: 1,
        duration: 0.6,
        delay: index * 0.15,
        ease: "back.out(1.7)",
      });
    });

    // Animate character avatar
    this.characterAvatar.alpha = 0;
    this.characterAvatar.y += 50;
    gsap.to(this.characterAvatar, {
      alpha: 1,
      y: this.characterAvatar.y - 50,
      duration: 0.8,
      delay: 0.5,
      ease: "back.out(1.7)",
    });

    // Animate top bar
    this.topBar.alpha = 0;
    this.topBar.y = -60;
    gsap.to(this.topBar, {
      alpha: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
    });
  }

  public resize(width: number, height: number) {
    // Background - fill entire screen
    this.background.width = width;
    this.background.height = height;

    // Top bar - stretch across top
    const topBg = this.topBar.getChildAt(0) as Graphics;
    topBg.clear();
    topBg.roundRect(0, 0, width, 60, 8);
    topBg.fill(0x8b4513);
    topBg.stroke({ width: 2, color: 0xffd700 });

    // Position home icon at right edge
    const homeIcon = this.topBar.getChildAt(this.topBar.children.length - 1) as Sprite;
    homeIcon.x = width - 50;

    // Position location markers based on relative coordinates
    this.locationMarkers.children.forEach((location) => {
      const relativePos = (location as any).userData;
      location.x = width * relativePos.relativeX;
      location.y = height * relativePos.relativeY;
    });

    // Position character avatar at bottom center
    this.characterAvatar.x = width / 2;
    this.characterAvatar.y = height - 20;
  }
}
