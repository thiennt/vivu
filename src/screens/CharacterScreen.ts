import { Container, Text, Graphics, Sprite, Assets } from "pixi.js";
import { Menu } from "../ui/Menu";

// Main Character Screen Class
export class CharacterScreen extends Container {
    public static assetBundles = ['game'];

    private characterArea: Container;
    private characterFrame: Sprite;
    private levelArea: Graphics;
    private levelLabel: Text = new Text();
    private levelText: Text = new Text();
    private expLabel: Text = new Text();
    private expText: Text = new Text();
    private classLabel: Text = new Text();
    private classText: Text = new Text();

    private pointPanel: Graphics;
    private pointsLabel: Text;
    private pointsText: Text;
    private strLabel: Text = new Text();
    private strText: Text = new Text();
    private strMinusBtn: Text = new Text();
    private strPlusBtn: Text = new Text();
    private intLabel: Text = new Text();
    private intText: Text = new Text();
    private intMinusBtn: Text = new Text();
    private intPlusBtn: Text = new Text();
    private conLabel: Text = new Text();
    private conText: Text = new Text();
    private conMinusBtn: Text = new Text();
    private conPlusBtn: Text = new Text();
    private agiLabel: Text = new Text();
    private agiText: Text = new Text();
    private agiMinusBtn: Text = new Text();
    private agiPlusBtn: Text = new Text();

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
    private critRateLabel: Text = new Text();
    private critRateText: Text = new Text();
    private hitRateLabel: Text = new Text();
    private hitRateText: Text = new Text();
    private dodgeRateLabel: Text = new Text();
    private dodgeRateText: Text = new Text();

    private equipArea: Container;
    private equipPanel: Graphics;

    private equipLabel: Text = new Text();
    private skillLabel: Text = new Text();


    constructor() {
        super();

        this.menu = new Menu();
        this.addChild(this.menu);

        this.characterArea = new Container();
        this.addChild(this.characterArea);

        this.characterFrame = new Sprite(Assets.get('player_2'));
        this.characterFrame.anchor.set(0.5);
        this.characterFrame.scale.set(0.5);
        this.characterFrame.visible = true;
        this.characterArea.addChild(this.characterFrame);

        this.levelArea = new Graphics();
        this.characterArea.addChild(this.levelArea);

        this.createStatRow(this.levelLabel, 'Level', this.levelText, '1', this.characterArea);
        this.createStatRow(this.expLabel, 'EXP', this.expText, '0/100', this.characterArea);
        this.createStatRow(this.classLabel, 'Class', this.classText, 'Novice', this.characterArea);

        this.pointPanel = new Graphics();
        this.characterArea.addChild(this.pointPanel);

        // Points to Spend
        this.pointsLabel = new Text({
            text: 'Stats Points',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' }
        });
        this.pointsLabel.anchor.set(1, 0.5);
        this.characterArea.addChild(this.pointsLabel);

        this.pointsText = new Text({
            text: '4',
            style: { fontSize: 16, fill: 0x000000, fontWeight: 'bold', align: 'left' }
        });
        this.pointsText.anchor.set(0, 0.5);
        this.characterArea.addChild(this.pointsText);

        this.createPointRow(this.strLabel, 'STR', this.strText, '15', this.strMinusBtn, this.strPlusBtn);
        this.createPointRow(this.intLabel, 'INT', this.intText, '10', this.intMinusBtn, this.intPlusBtn);
        this.createPointRow(this.conLabel, 'CON', this.conText, '12', this.conMinusBtn, this.conPlusBtn);
        this.createPointRow(this.agiLabel, 'AGI', this.agiText, '11', this.agiMinusBtn, this.agiPlusBtn);

        this.statsArea = new Container();
        this.addChild(this.statsArea);

        this.statsPanel = new Graphics();
        this.statsArea.addChild(this.statsPanel);

        this.createStatRow(this.hpLabel, 'HP', this.hpText, '250', this.statsArea);
        this.createStatRow(this.atkLabel, 'ATK', this.atkText, '60', this.statsArea);
        this.createStatRow(this.magLabel, 'MAG', this.magText, '60', this.statsArea);
        this.createStatRow(this.defLabel, 'DEF', this.defText, '32', this.statsArea);
        this.createStatRow(this.critRateLabel, 'Crit Rate', this.critRateText, '5%', this.statsArea);
        this.createStatRow(this.hitRateLabel, 'Hit Rate', this.hitRateText, '98%', this.statsArea);
        this.createStatRow(this.dodgeRateLabel, 'Dodge Rate', this.dodgeRateText, '7%', this.statsArea);

        
        this.equipArea = new Container();
        this.addChild(this.equipArea);

        this.equipPanel = new Graphics();
        this.equipArea.addChild(this.equipPanel);

        this.equipLabel.text = 'Equipment';
        this.equipLabel.style = { fontSize: 18, fill: 0x000000, fontWeight: 'bold', stroke: 'black', strokeThickness: 1 };
        this.equipLabel.interactive = true;
        this.equipLabel.eventMode = 'static';
        this.equipLabel.cursor = 'pointer';
        this.equipArea.addChild(this.equipLabel);

        this.skillLabel.text = 'Skills';
        this.skillLabel.style = { fontSize: 18, fill: 0x000000, fontWeight: 'bold' };
        this.skillLabel.interactive = true;
        this.skillLabel.eventMode = 'static';
        this.skillLabel.cursor = 'pointer';
        this.equipArea.addChild(this.skillLabel);
        
    }

    public createPointRow(statsLabel: Text, statsName: string, statsValueText: Text, statsValue: string, minusBtn: Text, plusBtn: Text) {
        statsLabel.text = statsName;
        statsLabel.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'left' };
        statsLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(statsLabel);

        statsValueText.text = statsValue;
        statsValueText.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' };
        statsValueText.anchor.set(0, 0.5);
        this.characterArea.addChild(statsValueText);

        minusBtn.text = '-';
        minusBtn.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'center' };
        minusBtn.anchor.set(0.5, 0.5);
        minusBtn.interactive = true;
        minusBtn.eventMode = 'static';
        minusBtn.cursor = 'pointer';
        this.characterArea.addChild(minusBtn);

        plusBtn.text = '+';
        plusBtn.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'center' };
        plusBtn.anchor.set(0.5, 0.5);
        plusBtn.interactive = true;
        plusBtn.eventMode = 'static';
        plusBtn.cursor = 'pointer';
        this.characterArea.addChild(plusBtn);
    }

    public createStatRow(statsLabel: Text, statsName: string, statsValueText: Text, statsValue: string, parent: Container) {
        statsLabel.text = statsName;
        statsLabel.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'left' };
        statsLabel.anchor.set(0, 0.5);
        parent.addChild(statsLabel);

        statsValueText.text = statsValue;
        statsValueText.style = { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' };
        statsValueText.anchor.set(1, 0.5);
        parent.addChild(statsValueText);
    }

    public async show() {
        this.menu.show();
    }

    public resize(width: number, height: number) {
        this.menu.resize(width, height);

        let menuLine = this.menu.y;

        this.characterArea.x = 0;
        this.characterArea.y = 0;

        this.characterFrame.x = 100;
        this.characterFrame.y = 150;

        this.levelArea.roundRect(200, 20, width - 220, this.characterFrame.height, 10);
        this.levelArea.fill(0xffffff);
        
        this.levelLabel.x = 220;
        this.levelLabel.y = 40;
        this.levelText.x = width - 40;
        this.levelText.y = 40;
        
        this.expLabel.x = 220;
        this.expLabel.y = 70;
        this.expText.x = width - 40;
        this.expText.y = 70;

        this.classLabel.x = 220;
        this.classLabel.y = 100;
        this.classText.x = width - 40;
        this.classText.y = 100;

        let pointLine = 120;

        this.pointPanel.roundRect(210, pointLine, 260, 160, 10);
        this.pointPanel.fill(0xE6E6E6);

        this.pointsLabel.x = 370;
        this.pointsLabel.y = pointLine + 15;
        this.pointsText.x = width - 100;
        this.pointsText.y = pointLine + 15;

        this.strLabel.x = 220;
        this.strLabel.y = pointLine + 45;
        this.strText.x = width - 200;
        this.strText.y = pointLine + 45;
        this.strMinusBtn.x = 400;
        this.strMinusBtn.y = pointLine + 45;
        this.strPlusBtn.x = 450;
        this.strPlusBtn.y = pointLine + 45;

        this.intLabel.x = 220;
        this.intLabel.y = pointLine + 75;
        this.intText.x = width - 200;
        this.intText.y = pointLine + 75;
        this.intMinusBtn.x = 400;
        this.intMinusBtn.y = pointLine + 75;
        this.intPlusBtn.x = 450;
        this.intPlusBtn.y = pointLine + 75;

        this.conLabel.x = 220;
        this.conLabel.y = pointLine + 105
        this.conText.x = width - 200;
        this.conText.y = pointLine + 105
        this.conMinusBtn.x = 400;
        this.conMinusBtn.y = pointLine + 105;
        this.conPlusBtn.x = 450;
        this.conPlusBtn.y = pointLine + 105;

        this.agiLabel.x = 220;
        this.agiLabel.y = pointLine + 135;
        this.agiText.x = width - 200;
        this.agiText.y = pointLine + 135;
        this.agiMinusBtn.x = 400;
        this.agiMinusBtn.y = pointLine + 135;
        this.agiPlusBtn.x = 450;
        this.agiPlusBtn.y = pointLine + 135;

        let statsLineX = 50;
        let statsLineY = pointLine + 180;

        this.statsPanel.roundRect(10, statsLineY, width - 20, 150, 10);
        this.statsPanel.fill(0xffffff);

        this.hpLabel.x = statsLineX;
        this.hpLabel.y = statsLineY + 20;
        this.hpText.x = statsLineX + 150;
        this.hpText.y = statsLineY + 20;

        this.atkLabel.x = statsLineX;
        this.atkLabel.y = statsLineY + 50;
        this.atkText.x = statsLineX + 150;
        this.atkText.y = statsLineY + 50;

        this.defLabel.x = statsLineX;
        this.defLabel.y = statsLineY + 80;
        this.defText.x = statsLineX + 150;
        this.defText.y = statsLineY + 80;

        this.magLabel.x = statsLineX;
        this.magLabel.y = statsLineY + 110;
        this.magText.x = statsLineX + 150;
        this.magText.y = statsLineY + 110;

        let statsLineXRight = width - 220;

        this.critRateLabel.x = statsLineXRight;
        this.critRateLabel.y = statsLineY + 20;
        this.critRateText.x = width - 50;
        this.critRateText.y = statsLineY + 20;

        this.hitRateLabel.x = statsLineXRight;
        this.hitRateLabel.y = statsLineY + 50;
        this.hitRateText.x = width - 50;
        this.hitRateText.y = statsLineY + 50;

        this.dodgeRateLabel.x = statsLineXRight;
        this.dodgeRateLabel.y = statsLineY + 80;
        this.dodgeRateText.x = width - 50;
        this.dodgeRateText.y = statsLineY + 80;

        let equipLineY = menuLine - 330;
        this.equipArea.x = 0;
        this.equipArea.y = equipLineY;

        this.equipPanel.roundRect(10, 0, width - 20, 310, 10);
        this.equipPanel.fill(0xffffff);

        this.equipLabel.x = 30;
        this.equipLabel.y = 10;
        this.skillLabel.x = 200;
        this.skillLabel.y = 10;
    }

    public update(time: Ticker) {
    }
}

// Usage (in your PixiJS v8 Application):
// import { CharacterLayout } from './CharacterLayout';
// const layout = new CharacterLayout();
// layout.x = 10; layout.y = 10;
// app.stage.addChild(layout);

// Make sure to load your skill icon images (e.g., skill_fire.png, etc.) via Assets or as asset URLs.