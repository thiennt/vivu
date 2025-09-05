import { Container, Text, Graphics, Sprite, Assets, Texture, Ticker } from "pixi.js";
import { COLORS } from "../app";
import { FancyButton, MaskedFrame } from "@pixi/ui";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";
import { DropShadowFilter } from 'pixi-filters';
import { PlayerData } from "../utils/common";
import { fetchPlayerData, getCurrentPlayerId } from "../utils/playerApi";



// Main Character Screen Class
export class CharacterScreen extends Container {
    public static assetBundles = ['game'];

    private backIcon: Sprite;

    // Loading state
    private isLoading: boolean = false;
    private loadingText!: Text;
    private playerData: PlayerData | null = null;

    private characterArea!: Container;
    private characterFrame!: FancyButton;
    private levelArea!: Graphics;
    private levelLabel: Text = new Text();
    private levelText: Text = new Text();
    private expLabel: Text = new Text();
    private expText: Text = new Text();
    private awakingLabel: Text = new Text();
    private awakingText: Text = new Text();

    private skillIcon1!: Graphics;
    private skillIcon2!: Graphics;
    private skillButton!: Sprite;

    private pointPanel!: Graphics;
    private pointsLabel!: Text;
    private pointsText!: Text;
    private strLabel: Text = new Text();
    private strText: Text = new Text();
    private strMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private strPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private staLabel: Text = new Text();
    private staText: Text = new Text();
    private staMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private staPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private agiLabel: Text = new Text();
    private agiText: Text = new Text();
    private agiMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private agiPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private pointApplyBtn: FancyButton = new FancyButton();

    private statArea!: Container;
    private statPanel!: Graphics;
    private hpLabel: Text = new Text();
    private hpText: Text = new Text();
    private atkLabel: Text = new Text();
    private atkText: Text = new Text();
    private defLabel: Text = new Text();
    private defText: Text = new Text();
    private lukLabel: Text = new Text();
    private lukText: Text = new Text();
    private hitRateLabel: Text = new Text();
    private hitRateText: Text = new Text();
    private dodgeRateLabel: Text = new Text();
    private dodgeRateText: Text = new Text();

    private equipArea!: Container;
    private equipPanel!: Graphics;

    private equipTabPanel!: Graphics;
    private equipLabel: Text = new Text();


    constructor() {
        super();

        const background = new Sprite(Assets.get('background_1.png'));
        background.width = navigation.width;
        background.height = navigation.height;
        this.addChild(background);

        this.backIcon = Sprite.from(Assets.get('back'));
        this.backIcon.anchor.set(0.5, 0.5);
        this.backIcon.interactive = true;
        this.backIcon.cursor = 'pointer';
        this.backIcon.on('click', () => {
            navigation.showScreen(HomeScreen);
        });
        this.addChild(this.backIcon);

        // Initialize loading text
        this.loadingText = new Text({
            text: 'Loading player data...',
            style: {
                fontSize: 24,
                fill: COLORS.white,
                fontWeight: 'bold',
                align: 'center'
            }
        });
        this.loadingText.anchor.set(0.5);
        this.addChild(this.loadingText);

        this.initializeUI();
        
        // Fetch and populate player data
        this.fetchAndPopulatePlayer();
    }

    /**
     * Initialize all UI components with default/placeholder values
     */
    private initializeUI() {
        this.characterArea = new Container();
        this.addChild(this.characterArea);

        this.levelArea = new Graphics();
        this.characterArea.addChild(this.levelArea);

        this.characterFrame = new FancyButton();
        this.createAvatarFrame(this.characterFrame);
        this.characterArea.addChild(this.characterFrame);

        // Create stat rows with placeholder values - will be updated when data loads
        this.createStatRow(this.levelLabel, 'LEVEL', this.levelText, '...', this.characterArea);
        this.createStatRow(this.expLabel, 'EXP', this.expText, '.../...', this.characterArea);
        this.createStatRow(this.awakingLabel, 'RANK', this.awakingText, '...', this.characterArea);

        this.skillIcon1 = new Graphics();
        this.characterArea.addChild(this.skillIcon1);

        this.skillIcon2 = new Graphics();
        this.characterArea.addChild(this.skillIcon2);

        this.skillButton = Sprite.from(Assets.get('spellbook'));
        this.skillButton.anchor.set(0.5, 0.5);
        this.skillButton.interactive = true;
        this.skillButton.cursor = 'pointer';
        this.characterArea.addChild(this.skillButton);

        this.pointPanel = new Graphics();
        this.characterArea.addChild(this.pointPanel);

        // Points to Spend
        this.pointsLabel = new Text({
            text: 'Points',
            style: { fontSize: 16, fill: COLORS.blueLight, fontWeight: 'bold', align: 'right' }
        });
        this.pointsLabel.anchor.set(1, 0.5);
        this.characterArea.addChild(this.pointsLabel);

        this.pointsText = new Text({
            text: '...',
            style: { fontSize: 18, fill: COLORS.white, fontWeight: 'bold', align: 'left' }
        });
        this.pointsText.anchor.set(0, 0.5);
        this.characterArea.addChild(this.pointsText);

        // Create point allocation rows with placeholder values
        this.createPointRow(this.strLabel, 'STR', this.strText, '...', this.strMinusBtn, this.strPlusBtn);
        this.createPointRow(this.staLabel, 'STA', this.staText, '...', this.staMinusBtn, this.staPlusBtn);
        this.createPointRow(this.agiLabel, 'AGI', this.agiText, '...', this.agiMinusBtn, this.agiPlusBtn);

        this.createApplyButton();
        this.characterArea.addChild(this.pointApplyBtn);

        this.statArea = new Container();
        this.addChild(this.statArea);

        this.statPanel = new Graphics();
        this.statArea.addChild(this.statPanel);

        // Create stat display rows with placeholder values
        this.createStatRow(this.hpLabel, 'HP', this.hpText, '...', this.statArea);
        this.createStatRow(this.atkLabel, 'ATK', this.atkText, '...', this.statArea);
        this.createStatRow(this.defLabel, 'DEF', this.defText, '...', this.statArea);
        this.createStatRow(this.lukLabel, 'LUCK', this.lukText, '...%', this.statArea);
        this.createStatRow(this.hitRateLabel, 'HIT', this.hitRateText, '...%', this.statArea);
        this.createStatRow(this.dodgeRateLabel, 'EVADE', this.dodgeRateText, '...%', this.statArea);

        this.equipArea = new Container();
        this.addChild(this.equipArea);

        this.equipPanel = new Graphics();
        this.equipArea.addChild(this.equipPanel);

        this.equipTabPanel = new Graphics();
        this.equipArea.addChild(this.equipTabPanel);

        this.equipLabel.text = 'EQUIPMENT';
        this.equipLabel.style = { 
            fontSize: 18,
            fontFamily: `'Cinzel', serif`,
            fontWeight: 'bold',
            fill: COLORS.blueLight, 
            dropShadow: {
                color: COLORS.blueDark,
                blur: 4,
                alpha: 0.5,
                distance: 2
            }
        };
        this.equipLabel.interactive = true;
        this.equipLabel.eventMode = 'static';
        this.equipLabel.cursor = 'pointer';
        this.equipArea.addChild(this.equipLabel);
        
        // Initially hide UI until data loads
        this.setLoadingState(true);
    }

    /**
     * Async method to fetch and populate player data from API
     * TODO: Make player ID configurable from authentication/session
     */
    private async fetchAndPopulatePlayer(): Promise<void> {
        try {
            this.setLoadingState(true);
            
            // Get player ID (currently using default ID - future: from config/auth)
            const playerId = getCurrentPlayerId();
            
            // Fetch player data from API
            this.playerData = await fetchPlayerData(playerId);
            
            // Populate UI with fetched data
            this.populatePlayerData(this.playerData);
            
            this.setLoadingState(false);
        } catch (error) {
            console.error('Failed to load player data:', error);
            this.setLoadingState(false);
            // TODO: Show error message to user
            this.showErrorState();
        }
    }

    /**
     * Populate UI elements with player data
     */
    private populatePlayerData(data: PlayerData): void {
        // Update avatar (using current system)
        // TODO: Update avatar frame to use data.avatar when dynamic avatars are implemented
        
        // Update character info
        this.levelText.text = data.player.level.toString();
        this.expText.text = `${data.player.exp}`;

        // Update point allocation
        this.pointsText.text = data.player.points.toString();
        this.strText.text = data.player.str.toString();
        this.staText.text = data.player.sta.toString();
        this.agiText.text = data.player.agi.toString();

        // Update stat displays
        this.hpText.text = data.player.character.hp.toString();
        this.atkText.text = data.player.character.atk.toString();
        this.defText.text = data.player.character.def.toString();
        this.lukText.text = `${data.player.luck}%`;
        this.hitRateText.text = `${data.player.character.hit_rate}%`;
        this.dodgeRateText.text = `${data.player.character.dodge}%`;
    }

    /**
     * Set loading state and show/hide loading indicator
     */
    private setLoadingState(loading: boolean): void {
        this.isLoading = loading;
        this.loadingText.visible = loading;
        
        // Hide/show main UI elements during loading
        this.characterArea.visible = !loading;
        this.statArea.visible = !loading;
        this.equipArea.visible = !loading;
    }

    /**
     * Show error state when API fails
     */
    private showErrorState(): void {
        this.loadingText.text = 'Failed to load player data';
        this.loadingText.style.fill = COLORS.red || '#ff0000';
        this.loadingText.visible = true;
        
        // TODO: Add retry button or fallback to default values
    }

    public addBackground() {
        // const gradient = new FillGradient({
        //     start: { x: 0, y: 0 },
        //     end: { x: 1, y: 1 },
        //     type: 'linear',
        //     colorStops: [
        //         { offset: 0, color: COLORS.panelBg },
        //         { offset: 0.7, color: COLORS.panelBg },
        //         { offset: 1, color: COLORS.panelBgDark }
        //     ],
        // });
    
        // // Create a background graphics object and fill it with the gradient
        // this.background.rect(0, 0, navigation.width, navigation.height);
        // this.background.fill(gradient);
    }

    public createApplyButton() {
        const graphic = new Graphics();
        graphic.roundRect(0, 0, 100, 40, 5);
        graphic.stroke({ width: 2, color: COLORS.blueDark });
        graphic.fill(COLORS.blueLight);

        this.pointApplyBtn.defaultView = graphic;

        this.pointApplyBtn.textView = new Text({
            text: 'Apply',
            style: {
                fill: COLORS.white,
                fontSize: 18,
                fontWeight: 'bold',
            },
        });
        this.pointApplyBtn.defaultTextScale = 1;
        this.pointApplyBtn.defaultTextAnchor = {
            x: 0.5,
            y: 0.5,
        };
        this.pointApplyBtn.textOffset = { x: 0, y: 0 };
        this.pointApplyBtn.padding = 10;
        this.pointApplyBtn.anchor.set(0.5, 0.5);
    }

    public createAvatarFrame(frame: FancyButton) {
        const target = Sprite.from('avatar');
        target.width = 120;
        target.height = 120;

        const icon = new MaskedFrame({
            target,
            mask: new Graphics()
                .circle(target.width / 2, target.height / 2, target.width / 2)
                .fill(COLORS.RARITY.NOVICE),
            borderWidth: 10,
            borderColor: COLORS.RARITY.NOVICE,
        });

        const graphic = new Graphics();
        graphic.circle(target.width / 2, target.height / 2, target.width / 2);
        graphic.fill(COLORS.RARITY.NOVICE);

        frame.defaultView = graphic;
        frame.iconView = icon;
        frame.defaultIconScale = 1;
        frame.defaultIconAnchor = {
            x: 0.5,
            y: 0.5,
        };
        frame.iconOffset = { x: 0, y: 0 };
        frame.padding = 3;
        frame.anchor.set(0.5, 0.5);
    }

    public createPointRow(statLabel: Text, statName: string, statValueText: Text, statValue: string, minusBtn: Sprite, plusBtn: Sprite) {
        statLabel.text = statName;
        statLabel.style = { fontSize: 14, fill: COLORS.blueLight, fontWeight: 'bold', align: 'left' };
        statLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(statLabel);

        statValueText.text = statValue;
        statValueText.style = { fontSize: 16, fill: COLORS.white, fontWeight: 'bold', align: 'right' };
        statValueText.anchor.set(0, 0.5);
        this.characterArea.addChild(statValueText);

        minusBtn.texture = Assets.get('minus');
        minusBtn.anchor.set(0.5, 0.5);
        minusBtn.scale.set(0.5, 0.5);
        minusBtn.interactive = true;
        minusBtn.eventMode = 'static';
        minusBtn.cursor = 'pointer';
        this.characterArea.addChild(minusBtn);

        plusBtn.texture = Assets.get('plus');
        plusBtn.anchor.set(0.5, 0.5);
        plusBtn.scale.set(0.5, 0.5);
        plusBtn.interactive = true;
        plusBtn.eventMode = 'static';
        plusBtn.cursor = 'pointer';
        this.characterArea.addChild(plusBtn);
    }

    public createStatRow(statLabel: Text, statName: string, statValueText: Text, statValue: string, parent: Container) {
        statLabel.text = statName;
        statLabel.style = { fontSize: 14, fill: COLORS.blueLight, fontWeight: 'bold', align: 'left' };
        statLabel.anchor.set(0, 0.5);
        parent.addChild(statLabel);

        statValueText.text = statValue;
        statValueText.style = { fontSize: 16, fill: COLORS.white, fontWeight: 'bold', align: 'right' };
        statValueText.anchor.set(1, 0.5);
        parent.addChild(statValueText);
    }

    public async show() {
        // Center loading text when screen shows
        this.loadingText.x = navigation.width / 2;
        this.loadingText.y = navigation.height / 2;
    }

    public drawPanel(graphic: Graphics, x: number, y: number, width: number, height: number) {
        const dropShadowFilter = new DropShadowFilter({
            color: COLORS.blue,
            alpha: 0.5,
            blur: 5,
            quality: 3,
        });
        graphic.roundRect(x + 4, y, width - 4, height, 5)
            .stroke({ width: 4, color: COLORS.blueLight })
            .fill({ color: COLORS.blueDark, alpha: 0.8 });
        graphic.filters = [dropShadowFilter];
    }

    public drawLine(graphic: Graphics, x: number, y: number, width: number, height: number) {
        graphic.roundRect(x, y, width, height, 1)
            .fill(COLORS.white);
    }

    public resize(width: number, height: number) {
        this.backIcon.x = width - 50;
        this.backIcon.y = 50;

        const characterLine = height - 800;

        // === AVATAR PANEL SECTION ===
        this.drawPanel(this.levelArea, 10, characterLine, width - 20, height - 110);

        this.characterFrame.x = 110;
        this.characterFrame.y = characterLine + 90;

        // === NAME/CLASS/LEVEL SECTION ===
        this.levelLabel.x = 220;
        this.levelLabel.y = characterLine + 20;
        this.levelText.x = width - 40;
        this.levelText.y = characterLine + 20;
        
        this.expLabel.x = 220;
        this.expLabel.y = characterLine + 50;
        this.expText.x = width - 40;
        this.expText.y = characterLine + 50;

        this.awakingLabel.x = 220;
        this.awakingLabel.y = characterLine + 80;
        this.awakingText.x = width - 40;
        this.awakingText.y = characterLine + 80;

        // === SKILL/EQUIPMENT PREVIEW ===
        this.skillIcon1.clear().roundRect(220, characterLine + 110, 50, 50, 10)
            .fill(COLORS.gray);

        this.skillIcon2.clear().roundRect(280, characterLine + 110, 50, 50, 10)
            .fill(COLORS.gray);
        
        this.skillButton.x = 370;
        this.skillButton.y = characterLine + 135;

        // === POINT ALLOCATION SECTION ===
        const pointLine = characterLine + 200;
        const pointX = width / 2;

        // Visual separator line for point allocation section
        this.drawLine(this.pointPanel, 40, pointLine, width - 80, 1);
        
        this.pointsLabel.x = pointX + 150;
        this.pointsLabel.y = pointLine + 15;
        this.pointsText.x = pointX + 180;
        this.pointsText.y = pointLine + 15;

        // Point allocation rows with better spacing
        this.strLabel.x = pointX + 20;
        this.strLabel.y = pointLine + 45;
        this.strText.x = pointX + 100;
        this.strText.y = pointLine + 45;
        this.strMinusBtn.x = pointX + 160;
        this.strMinusBtn.y = pointLine + 45;
        this.strPlusBtn.x = pointX + 200;
        this.strPlusBtn.y = pointLine + 45;

        this.staLabel.x = pointX + 20;
        this.staLabel.y = pointLine + 75;
        this.staText.x = pointX + 100;
        this.staText.y = pointLine + 75;
        this.staMinusBtn.x = pointX + 160;
        this.staMinusBtn.y = pointLine + 75;
        this.staPlusBtn.x = pointX + 200;
        this.staPlusBtn.y = pointLine + 75;

        this.agiLabel.x = pointX + 20;
        this.agiLabel.y = pointLine + 135;
        this.agiText.x = pointX + 100;
        this.agiText.y = pointLine + 135;
        this.agiMinusBtn.x = pointX + 160;
        this.agiMinusBtn.y = pointLine + 135;
        this.agiPlusBtn.x = pointX + 200;
        this.agiPlusBtn.y = pointLine + 135;

        // === ACTIONS SECTION ===
        this.pointApplyBtn.x = pointX + 120;
        this.pointApplyBtn.y = pointLine + 180;

        // === STAT DISPLAY SECTION ===
        const statLineX = 40;
        const statLineY = pointLine;

        // Left column stats with better visual grouping
        this.hpLabel.x = statLineX;
        this.hpLabel.y = statLineY + 20;
        this.hpText.x = statLineX + 170;
        this.hpText.y = statLineY + 20;

        this.atkLabel.x = statLineX;
        this.atkLabel.y = statLineY + 50;
        this.atkText.x = statLineX + 170;
        this.atkText.y = statLineY + 50;

        this.defLabel.x = statLineX;
        this.defLabel.y = statLineY + 80;
        this.defText.x = statLineX + 170;
        this.defText.y = statLineY + 80;

        this.lukLabel.x = statLineX;
        this.lukLabel.y = statLineY + 140;
        this.lukText.x = statLineX + 170;
        this.lukText.y = statLineY + 140;

        this.hitRateLabel.x = statLineX;
        this.hitRateLabel.y = statLineY + 170;
        this.hitRateText.x = statLineX + 170;
        this.hitRateText.y = statLineY + 170;

        this.dodgeRateLabel.x = statLineX;
        this.dodgeRateLabel.y = statLineY + 200;
        this.dodgeRateText.x = statLineX + 170;
        this.dodgeRateText.y = statLineY + 200;

        // === EQUIPMENT SECTION ===
        const equipLineY = height - 360;

        // Visual separator for equipment section
        this.drawLine(this.equipTabPanel, 30, equipLineY + 40, width - 70, 1);

        this.equipLabel.x = (width - this.equipLabel.width) / 2;
        this.equipLabel.y = equipLineY + 10;
    }

    public update(_time: Ticker) {
        // Update method for any animations or dynamic content
    }
}