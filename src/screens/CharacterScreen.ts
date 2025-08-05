import { Container, Text, Graphics, Sprite, Assets, Texture, Mask } from "pixi.js";
import { COLORS } from "../app";
import { FancyButton, MaskedFrame } from "@pixi/ui";
import { navigation } from "../utils/navigation";
import { HomeScreen } from "./HomeScreen";
import { miniAppEmbedNextSchema } from "@farcaster/miniapp-sdk";


// Main Character Screen Class
export class CharacterScreen extends Container {
    public static assetBundles = ['game'];

    private background: Sprite;

    private backIcon: Sprite;

    private characterArea: Container;
    private characterFrame: FancyButton;
    private levelArea: Graphics;
    private levelLabel: Text = new Text();
    private levelText: Text = new Text();
    private expLabel: Text = new Text();
    private expText: Text = new Text();
    private classLabel: Text = new Text();
    private classText: Text = new Text();

    private skillIcon1: Graphics;
    private skillIcon2: Graphics;
    private skillButton: Sprite;

    private pointPanel: Graphics;
    private pointsLabel: Text;
    private pointsText: Text;
    private strLabel: Text = new Text();
    private strText: Text = new Text();
    private strMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private strPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private intLabel: Text = new Text();
    private intText: Text = new Text();
    private intMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private intPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private conLabel: Text = new Text();
    private conText: Text = new Text();
    private conMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private conPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private agiLabel: Text = new Text();
    private agiText: Text = new Text();
    private agiMinusBtn: Sprite = new Sprite(Texture.WHITE);
    private agiPlusBtn: Sprite = new Sprite(Texture.WHITE);
    private pointApplyBtn: FancyButton = new FancyButton();

    private statsArea: Container;
    private statsPanel: Graphics;
    private hpLabel: Text = new Text();
    private hpText: Text = new Text();
    private atkLabel: Text = new Text();
    private atkText: Text = new Text();
    private magLabel: Text = new Text();
    private magText: Text = new Text();
    private defLabel: Text = new Text();
    private defText: Text = new Text();
    private lukLabel: Text = new Text();
    private lukText: Text = new Text();
    private hitRateLabel: Text = new Text();
    private hitRateText: Text = new Text();
    private dodgeRateLabel: Text = new Text();
    private dodgeRateText: Text = new Text();

    private equipArea: Container;
    private equipPanel: Graphics;

    private equipTabPanel: Graphics
    private equipLabel: Text = new Text();


    constructor() {
        super();

        this.background = new Sprite(Assets.get('background'));
        this.addChild(this.background);

        this.backIcon = Sprite.from(Assets.get('back'));
        this.backIcon.anchor.set(0.5, 0.5);
        this.backIcon.interactive = true;
        this.backIcon.cursor = 'pointer';
        this.backIcon.on('click', () => {
            navigation.showScreen(HomeScreen);
        });
        this.addChild(this.backIcon);

        this.characterArea = new Container();
        this.addChild(this.characterArea);

        this.levelArea = new Graphics();
        this.characterArea.addChild(this.levelArea);

        this.characterFrame = new FancyButton();
        this.createAvatarFrame(this.characterFrame);
        this.characterArea.addChild(this.characterFrame);

        this.createStatRow(this.levelLabel, 'LEVEL', this.levelText, '1', this.characterArea);
        this.createStatRow(this.expLabel, 'EXP', this.expText, '0/100', this.characterArea);
        this.createStatRow(this.classLabel, 'RANK', this.classText, 'NOVICE', this.characterArea);

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
            text: 'Stats Points',
            style: { fontSize: 16, fill: COLORS.FRAME_LABEL_HIGHLIGHTED, fontWeight: 'bold', align: 'right' }
        });
        this.pointsLabel.anchor.set(1, 0.5);
        this.characterArea.addChild(this.pointsLabel);

        this.pointsText = new Text({
            text: '4',
            style: { fontSize: 18, fill: COLORS.FRAME_TEXT, fontWeight: 'bold', align: 'left' }
        });
        this.pointsText.anchor.set(0, 0.5);
        this.characterArea.addChild(this.pointsText);

        this.createPointRow(this.strLabel, 'STR', this.strText, '15', this.strMinusBtn, this.strPlusBtn);
        this.createPointRow(this.intLabel, 'INT', this.intText, '10', this.intMinusBtn, this.intPlusBtn);
        this.createPointRow(this.conLabel, 'CON', this.conText, '12', this.conMinusBtn, this.conPlusBtn);
        this.createPointRow(this.agiLabel, 'AGI', this.agiText, '11', this.agiMinusBtn, this.agiPlusBtn);

        this.createApplyButton();
        this.characterArea.addChild(this.pointApplyBtn);

        this.statsArea = new Container();
        this.addChild(this.statsArea);

        this.statsPanel = new Graphics();
        this.statsArea.addChild(this.statsPanel);

        this.createStatRow(this.hpLabel, 'HP', this.hpText, '250', this.statsArea);
        this.createStatRow(this.atkLabel, 'ATK', this.atkText, '60', this.statsArea);
        this.createStatRow(this.magLabel, 'MAG', this.magText, '60', this.statsArea);
        this.createStatRow(this.defLabel, 'DEF', this.defText, '32', this.statsArea);
        this.createStatRow(this.lukLabel, 'LUCK', this.lukText, '5%', this.statsArea);
        this.createStatRow(this.hitRateLabel, 'HIT', this.hitRateText, '98%', this.statsArea);
        this.createStatRow(this.dodgeRateLabel, 'EVADE', this.dodgeRateText, '7%', this.statsArea);

        this.equipArea = new Container();
        this.addChild(this.equipArea);

        this.equipPanel = new Graphics();
        this.equipArea.addChild(this.equipPanel);

        this.equipTabPanel = new Graphics();
        this.equipArea.addChild(this.equipTabPanel);

        this.equipLabel.text = 'EQUIPMENT';
        this.equipLabel.style = { fontSize: 18, fill: 0xffffff, fontWeight: 'bold', stroke: 'black' };
        this.equipLabel.interactive = true;
        this.equipLabel.eventMode = 'static';
        this.equipLabel.cursor = 'pointer';
        this.equipArea.addChild(this.equipLabel);
    }

    public createApplyButton() {
        const graphic = new Graphics();
        graphic.rect(0, 0, 100, 40);
        graphic.fill(COLORS.BUTTON_OK);

        this.pointApplyBtn.defaultView = graphic;

        this.pointApplyBtn.textView = new Text({
            text: 'Apply',
            style: {
                fill: '#FFFFFF',
                fontFamily: 'Arial',
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
        target.width = 160;
        target.height = 160;

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

    public createPointRow(statsLabel: Text, statsName: string, statsValueText: Text, statsValue: string, minusBtn: Sprite, plusBtn: Sprite) {
        statsLabel.text = statsName;
        statsLabel.style = { fontSize: 16, fill: COLORS.FRAME_LABEL, fontWeight: 'bold', align: 'left' };
        statsLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(statsLabel);

        statsValueText.text = statsValue;
        statsValueText.style = { fontSize: 16, fill: COLORS.FRAME_TEXT, fontWeight: 'bold', align: 'right' };
        statsValueText.anchor.set(0, 0.5);
        this.characterArea.addChild(statsValueText);

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

    public createStatRow(statsLabel: Text, statsName: string, statsValueText: Text, statsValue: string, parent: Container) {
        statsLabel.text = statsName;
        statsLabel.style = { fontSize: 16, fill: COLORS.FRAME_LABEL, fontWeight: 'bold', align: 'left' };
        statsLabel.anchor.set(0, 0.5);
        parent.addChild(statsLabel);

        statsValueText.text = statsValue;
        statsValueText.style = { fontSize: 16, fill: COLORS.FRAME_TEXT, fontWeight: 'bold', align: 'right' };
        statsValueText.anchor.set(1, 0.5);
        parent.addChild(statsValueText);
    }

    public async show() {
    }

    public drawPanel(graphic: Graphics, x: number, y: number, width: number, height: number) {
        graphic.roundRect(x, y, width, height, 10)
            .fill(COLORS.FRAME_BORDER)
            .roundRect(x + 3, y + 3, width - 5, height - 5, 10)
            .fill(COLORS.FRAME_BACKGROUND);
    }

    public resize(width: number, height: number) {
        this.background.width = width;
        this.background.height = height;

        this.backIcon.x = width - 50;
        this.backIcon.y = 50;

        let menuLine = height;

        let characterLine = menuLine - 800;

        this.drawPanel(this.levelArea, 10, characterLine, width - 20, this.characterFrame.height + 20);

        this.characterFrame.x = 110;
        this.characterFrame.y = characterLine + 90;

        this.levelLabel.x = 220;
        this.levelLabel.y = characterLine + 20;
        this.levelText.x = width - 40;
        this.levelText.y = characterLine + 20;
        
        this.expLabel.x = 220;
        this.expLabel.y = characterLine + 50;
        this.expText.x = width - 40;
        this.expText.y = characterLine + 50;

        this.classLabel.x = 220;
        this.classLabel.y = characterLine + 80;
        this.classText.x = width - 40;
        this.classText.y = characterLine + 80;

        this.skillIcon1.roundRect(220, characterLine + 110, 50, 50, 10)
            .fill(COLORS.FRAME_LABEL);

        this.skillIcon2.roundRect(280, characterLine + 110, 50, 50, 10)
            .fill(COLORS.FRAME_LABEL);
        
        this.skillButton.x = 370;
        this.skillButton.y = characterLine + 135;

        let pointLine = characterLine + 200;
        const pointX = width / 2;

        this.drawPanel(this.pointPanel, pointX, pointLine, 240, 220);
        
        this.pointsLabel.x = pointX + 150;
        this.pointsLabel.y = pointLine + 15;
        this.pointsText.x = pointX + 180;
        this.pointsText.y = pointLine + 15;

        this.strLabel.x = pointX + 20;
        this.strLabel.y = pointLine + 45;
        this.strText.x = pointX + 100;
        this.strText.y = pointLine + 45;
        this.strMinusBtn.x = pointX + 160;
        this.strMinusBtn.y = pointLine + 45;
        this.strPlusBtn.x = pointX + 200;
        this.strPlusBtn.y = pointLine + 45;

        this.intLabel.x = pointX + 20;
        this.intLabel.y = pointLine + 75;
        this.intText.x = pointX + 100;
        this.intText.y = pointLine + 75;
        this.intMinusBtn.x = pointX + 160;
        this.intMinusBtn.y = pointLine + 75;
        this.intPlusBtn.x = pointX + 200;
        this.intPlusBtn.y = pointLine + 75;

        this.conLabel.x = pointX + 20;
        this.conLabel.y = pointLine + 105;
        this.conText.x = pointX + 100;
        this.conText.y = pointLine + 105;
        this.conMinusBtn.x = pointX + 160;
        this.conMinusBtn.y = pointLine + 105;
        this.conPlusBtn.x = pointX + 200;
        this.conPlusBtn.y = pointLine + 105;

        this.agiLabel.x = pointX + 20;
        this.agiLabel.y = pointLine + 135;
        this.agiText.x = pointX + 100;
        this.agiText.y = pointLine + 135;
        this.agiMinusBtn.x = pointX + 160;
        this.agiMinusBtn.y = pointLine + 135;
        this.agiPlusBtn.x = pointX + 200;
        this.agiPlusBtn.y = pointLine + 135;

        this.pointApplyBtn.x = pointX + 120;
        this.pointApplyBtn.y = pointLine + 180;

        let statsLineX = 40;
        let statsLineY = pointLine;

        this.drawPanel(this.statsPanel, 10, statsLineY, 230, 220);

        this.hpLabel.x = statsLineX;
        this.hpLabel.y = statsLineY + 20;
        this.hpText.x = statsLineX + 170;
        this.hpText.y = statsLineY + 20;

        this.atkLabel.x = statsLineX;
        this.atkLabel.y = statsLineY + 50;
        this.atkText.x = statsLineX + 170;
        this.atkText.y = statsLineY + 50;

        this.defLabel.x = statsLineX;
        this.defLabel.y = statsLineY + 80;
        this.defText.x = statsLineX + 170;
        this.defText.y = statsLineY + 80;

        this.magLabel.x = statsLineX;
        this.magLabel.y = statsLineY + 110;
        this.magText.x = statsLineX + 170;
        this.magText.y = statsLineY + 110;

        this.lukLabel.x = statsLineX;
        this.lukLabel.y = statsLineY + 140;
        this.lukText.x = statsLineX + 170;
        this.lukText.y = statsLineY + 140;

        this.hitRateLabel.x = statsLineX;
        this.hitRateLabel.y = statsLineY + 170;
        this.hitRateText.x = statsLineX + 170;
        this.hitRateText.y = statsLineY + 170;

        this.dodgeRateLabel.x = statsLineX;
        this.dodgeRateLabel.y = statsLineY + 200;
        this.dodgeRateText.x = statsLineX + 170;
        this.dodgeRateText.y = statsLineY + 200;

        let equipLineY = menuLine - 360;

        this.drawPanel(this.equipPanel, 10, equipLineY, width - 20, 350);

        this.equipTabPanel.roundRect(10, equipLineY, width - 20, 50, 10)
            .fill(COLORS.FRAME_LABEL)

        this.equipLabel.x = (width - this.equipLabel.width) / 2;
        this.equipLabel.y = equipLineY + 10;
    }

    public update(time: Ticker) {
    }
}