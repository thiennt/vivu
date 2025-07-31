import { Container, Graphics, Text, Assets, AnimatedSprite } from "pixi.js";

export class CharacterScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["game"];

  private background!: Graphics;
  private statsContainer!: Container;
  private upgradePointsText!: Text;
  private statsTexts: { [key: string]: Text } = {};
  private upgradeButtons: { [key: string]: Container } = {};

  // Character data (this should ideally be shared/persisted)
  private characterData = {
    level: 1,
    upgradePoints: 5,
    stats: {
      hp: 16,
      maxHp: 16,
      atk: 5,
      str: 5, // renamed from def to str as requested
      crit: 20,
      agi: 3,
    } as { [key: string]: number },
  };

  constructor() {
    super();
    console.log("CharacterScreen constructor called");
    this.createUI();
  }

  private createUI() {
    // Background
    this.background = new Graphics();
    this.addChild(this.background);

    // Stats container (main card)
    this.statsContainer = new Container();
    this.addChild(this.statsContainer);

    // Upgrade points display
    this.upgradePointsText = new Text({
      text: `Upgrade Points: ${this.characterData.upgradePoints}`,
      style: {
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0x666666,
        align: "center",
      },
    });
    this.addChild(this.upgradePointsText);

    this.createStatsDisplay();
  }

  private createStatsDisplay() {
    // Create main stats card background
    const cardBg = new Graphics()
      .roundRect(0, 0, 400, 300, 12)
      .fill(0xffffff)
      .stroke({ width: 1, color: 0xe0e0e0 });
    this.statsContainer.addChild(cardBg);

    const stats = ["hp", "atk", "str", "crit", "agi"];
    const statNames = {
      hp: "HP",
      atk: "ATK",
      str: "STR",
      crit: "CRIT",
      agi: "AGI",
    };

    stats.forEach((stat, index) => {
      const row = this.createStatRow(
        stat,
        statNames[stat as keyof typeof statNames],
        index,
      );
      this.statsContainer.addChild(row);
    });
  }

  private createStatRow(
    stat: string,
    statName: string,
    index: number,
  ): Container {
    const row = new Container();
    const y = 30 + index * 50;

    // Stat icon
    const icon = this.createStatIcon(stat);
    icon.position.set(30, y);
    row.addChild(icon);

    // Stat name
    const nameText = new Text({
      text: statName,
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fontWeight: "600",
        fill: 0x333333,
      },
    });
    nameText.position.set(70, y - 8);
    row.addChild(nameText);

    // Stat value
    const valueText = new Text({
      text: this.getStatValue(stat),
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fontWeight: "bold",
        fill: 0x666666,
      },
    });
    valueText.position.set(220, y - 8);
    row.addChild(valueText);
    this.statsTexts[stat] = valueText;

    // Upgrade button
    const upgradeButton = this.createUpgradeButton(stat);
    upgradeButton.position.set(320, y - 15);
    row.addChild(upgradeButton);
    this.upgradeButtons[stat] = upgradeButton;

    return row;
  }

  private createStatIcon(statName: string): AnimatedSprite {
    try {
      const skillsSheet = Assets.get("stats");
      const animations = skillsSheet?.animations;
      if (!animations || !animations[statName]) {
        console.warn(`Animation not found for stat: ${statName}`);
        return new AnimatedSprite([]);
      }
      const icon = new AnimatedSprite(animations[statName]);
      icon.anchor.set(0.5);
      icon.width = 32;
      icon.height = 32;
      return icon;
    } catch (error) {
      console.error(`Error creating stat icon for ${statName}:`, error);
      return new AnimatedSprite([]);
    }
  }

  private createUpgradeButton(stat: string): Container {
    const button = new Container();

    // Button background - smaller, more modern
    const bg = new Graphics()
      .roundRect(0, 0, 30, 30, 15)
      .fill(0x4caf50)
      .stroke({ width: 1, color: 0x388e3c });
    button.addChild(bg);

    // Plus text
    const plusText = new Text({
      text: "+",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fontWeight: "bold",
        fill: 0xffffff,
        align: "center",
      },
    });
    plusText.anchor.set(0.5);
    plusText.position.set(15, 15);
    button.addChild(plusText);

    // Make interactive
    button.interactive = true;
    button.cursor = "pointer";

    // Button states
    button.on("pointerover", () => {
      if (this.characterData.upgradePoints > 0) {
        bg.clear()
          .roundRect(0, 0, 30, 30, 15)
          .fill(0x66bb6a)
          .stroke({ width: 1, color: 0x388e3c });
      }
    });

    button.on("pointerout", () => {
      const color = this.characterData.upgradePoints > 0 ? 0x4caf50 : 0xcccccc;
      const strokeColor =
        this.characterData.upgradePoints > 0 ? 0x388e3c : 0x999999;
      bg.clear()
        .roundRect(0, 0, 30, 30, 15)
        .fill(color)
        .stroke({ width: 1, color: strokeColor });
    });

    button.on("pointerdown", () => {
      this.upgradeStat(stat);
    });

    return button;
  }

  private getStatValue(stat: string): string {
    const value = this.characterData.stats[stat];
    if (stat === "hp") {
      return `${value}/${this.characterData.stats.maxHp}`;
    } else if (stat === "crit") {
      return `${value}%`;
    }
    return value.toString();
  }

  private upgradeStat(stat: string) {
    if (this.characterData.upgradePoints <= 0) return;

    // Deduct upgrade point
    this.characterData.upgradePoints--;

    // Increase stat
    if (stat === "hp") {
      this.characterData.stats.maxHp += 2;
      this.characterData.stats.hp += 2;
    } else if (stat === "crit") {
      this.characterData.stats[stat] += 5;
    } else {
      this.characterData.stats[stat] += 1;
    }

    // Update UI
    this.updateStatsDisplay();
    this.updateUpgradeButtons();

    // Save to localStorage (simple persistence)
    this.saveCharacterData();
  }

  private updateStatsDisplay() {
    Object.keys(this.statsTexts).forEach((stat) => {
      this.statsTexts[stat].text = this.getStatValue(stat);
    });

    this.upgradePointsText.text = `Upgrade Points: ${this.characterData.upgradePoints}`;
  }

  private updateUpgradeButtons() {
    Object.values(this.upgradeButtons).forEach((button) => {
      const bg = button.children[0] as Graphics;
      const color = this.characterData.upgradePoints > 0 ? 0x4caf50 : 0xcccccc;
      const strokeColor =
        this.characterData.upgradePoints > 0 ? 0x388e3c : 0x999999;
      bg.clear()
        .roundRect(0, 0, 30, 30, 15)
        .fill(color)
        .stroke({ width: 1, color: strokeColor });
    });
  }

  private saveCharacterData() {
    localStorage.setItem(
      "vivu_character_data",
      JSON.stringify(this.characterData),
    );
  }

  private loadCharacterData() {
    const saved = localStorage.getItem("vivu_character_data");
    if (saved) {
      this.characterData = JSON.parse(saved);
    }
  }

  public prepare() {
    this.loadCharacterData();
    this.updateStatsDisplay();
    this.updateUpgradeButtons();
  }

  public async show() {
    console.log("CharacterScreen show() called");
    // Fade in animation could be added here
  }

  public resize(width: number, height: number) {
    // Background - clean, light background
    this.background
      .clear()
      .rect(0, 0, width, height - 100) // -100 for menu bar
      .fill(0xf8f9fa);

    // Center the stats container
    this.statsContainer.x = (width - 400) / 2;
    this.statsContainer.y = (height - 400) / 2;

    // Position upgrade points display above the stats card
    this.upgradePointsText.x = width / 2 - this.upgradePointsText.width / 2;
    this.upgradePointsText.y = this.statsContainer.y - 40;
  }

  // Method to get current character data (for other screens to use)
  public getCharacterData() {
    return { ...this.characterData };
  }

  // Method to sync with external character data updates
  public updateCharacterData(newData: any) {
    this.characterData = { ...this.characterData, ...newData };
    this.updateStatsDisplay();
    this.updateUpgradeButtons();
    this.saveCharacterData();
  }
}
