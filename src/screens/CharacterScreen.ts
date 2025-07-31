import { Container, Text, Graphics, Sprite, Assets } from "pixi.js";
import { Menu } from "../ui/Menu";

// Utility function for creating labeled stat row
function createStatRow(
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
    parent: Container
) {
    const row = new Container();
    row.x = x;
    row.y = y;

    const labelText = new Text({
        text: label,
        style: { fontSize: 16, fill: 0xffffff, fontWeight: 'bold' }
    });
    row.addChild(labelText);

    const valueText = new Text({
        text: value,
        style: { fontSize: 16, fill: 0xffff00 }
    });
    valueText.x = width - valueText.width - 8;
    row.addChild(valueText);

    parent.addChild(row);
    return row;
}

// Add Skill Icons Bar
function createSkillBar(skills: { icon: string; name: string }[], x: number, y: number, parent: Container) {
    const SKILL_ICON_SIZE = 44;
    const SKILL_ICON_MARGIN = 12;
    const bar = new Container();
    bar.x = x;
    bar.y = y;

    for (let i = 0; i < skills.length; ++i) {
        const skill = skills[i];

        // Icon background
        const iconBg = new Graphics();
        iconBg.roundRect(0, 0, SKILL_ICON_SIZE, SKILL_ICON_SIZE, 8);
        iconBg.x = i * (SKILL_ICON_SIZE + SKILL_ICON_MARGIN);
        bar.addChild(iconBg);

        // Skill icon (dummy or from url)
        const iconSprite = Sprite.from(skill.icon);
        iconSprite.width = SKILL_ICON_SIZE - 8;
        iconSprite.height = SKILL_ICON_SIZE - 8;
        iconSprite.x = iconBg.x + 4;
        iconSprite.y = 4;
        bar.addChild(iconSprite);

        // Tooltip (optional: show on hover)
        iconSprite.eventMode = 'static';
        iconSprite.cursor = 'pointer';
        iconSprite.on('pointerover', () => {
            nameText.visible = true;
        });
        iconSprite.on('pointerout', () => {
            nameText.visible = false;
        });

        // Skill name text (hidden by default)
        const nameText = new Text({
            text: skill.name,
            style: { fontSize: 14, fill: 0xffffff, align: 'center', fontWeight: 'bold' }
        });
        nameText.anchor.set(0.5, 1);
        nameText.x = iconBg.x + SKILL_ICON_SIZE / 2;
        nameText.y = SKILL_ICON_SIZE + 2;
        nameText.visible = false;
        bar.addChild(nameText);
    }

    parent.addChild(bar);
    return bar;
}

// Main Character Screen Class
export class CharacterScreen extends Container {
    public static assetBundles = ['game'];

    private characterArea: Container;
    private characterFrame: Sprite;
    private levelArea: Graphics;
    private levelLabel: Text;
    private levelText: Text;
    private expLabel: Text;
    private expText: Text;
    private classLabel: Text;
    private classText: Text;
    private statPanel: Graphics;
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

        this.levelLabel = new Text({
            text: 'Level',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold' }
        });
        this.levelLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(this.levelLabel);

        this.levelText = new Text({
            text: '1',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' }
        });
        this.levelText.anchor.set(1, 0.5);
        this.characterArea.addChild(this.levelText);

        this.expLabel = new Text({
            text: 'EXP',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold' }
        });
        this.expLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(this.expLabel);

        this.expText = new Text({
            text: '0/100',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' }
        });
        this.expText.anchor.set(1, 0.5);
        this.characterArea.addChild(this.expText);

        this.classLabel = new Text({
            text: 'Class',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold' }
        });
        this.classLabel.anchor.set(0, 0.5);
        this.characterArea.addChild(this.classLabel);

        this.classText = new Text({
            text: 'Novice',
            style: { fontSize: 14, fill: 0x000000, fontWeight: 'bold', align: 'right' }
        });
        this.classText.anchor.set(1, 0.5);
        this.characterArea.addChild(this.classText);

        this.statPanel = new Graphics();
        this.characterArea.addChild(this.statPanel);

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

        this.createStatRow(this.strLabel, 'STR', this.strText, '15', this.strMinusBtn, this.strPlusBtn);
        this.createStatRow(this.intLabel, 'INT', this.intText, '10', this.intMinusBtn, this.intPlusBtn);
        this.createStatRow(this.conLabel, 'CON', this.conText, '12', this.conMinusBtn, this.conPlusBtn);
        this.createStatRow(this.agiLabel, 'AGI', this.agiText, '11', this.agiMinusBtn, this.agiPlusBtn);
        

        this.init();
        
    }

    public createStatRow(statsLabel: Text, statsName: string, statsValueText: Text, statsValue: string, minusBtn: Text, plusBtn: Text) {
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

    public init() {
        const WIDTH = 500;
        let y = 0;


        

        y += 220 + 8;


        y += 32 + 12;

        y += 100 + 12;

        // 4. Derived Stats Frame
        const statFrame = new Graphics();
        statFrame.roundRect(0, 0, WIDTH, 118, 10);
        statFrame.y = y;
        this.addChild(statFrame);

        const derivedStats = [
            { label: 'ATK', value: '60' },
            { label: 'DEF', value: '32' },
            { label: 'HP', value: '250' },
            { label: 'Crit Rate', value: '5%' },
            { label: 'Hit Rate', value: '98%' },
            { label: 'AGI', value: '11' },
            { label: 'Dodge Rate', value: '7%' }
        ];
        for (let i = 0; i < derivedStats.length; ++i) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            createStatRow(
                derivedStats[i].label,
                derivedStats[i].value,
                20 + col * (WIDTH / 2),
                12 + row * 28,
                WIDTH / 2 - 20,
                statFrame
            );
        }

        y += 118 + 12;

        // 5. Equipment Panel
        const equipPanel = new Graphics();
        equipPanel.roundRect(0, 0, WIDTH, 100, 12);
        equipPanel.y = y;
        this.addChild(equipPanel);

        const equipLabel = new Text({
            text: 'Equipment',
            style: { fontSize: 15, fill: 0x00cfff, fontWeight: 'bold' }
        });
        equipLabel.x = 16;
        equipLabel.y = 8;
        equipPanel.addChild(equipLabel);

        // Equipment slots (dummy)
        const equipSlots = ['Head', 'Body', 'Weapon', 'Accessory'];
        for (let i = 0; i < equipSlots.length; ++i) {
            const slotBox = new Graphics();
            slotBox.roundRect(0, 0, 52, 52, 8);
            slotBox.x = 20 + i * 64;
            slotBox.y = 36;
            equipPanel.addChild(slotBox);

            const slotText = new Text({
                text: equipSlots[i],
                style: { fontSize: 12, fill: 0xaaaaee }
            });
            slotText.x = slotBox.x + (52 - slotText.width) / 2;
            slotText.y = slotBox.y + 16;
            equipPanel.addChild(slotText);

            // Optionally add item icons to slotBox
        }

        // 6. Skills Bar (NEW)
        // Example skills
        const skills = [
            { icon: 'skill_fire.png', name: 'Fireball' },
            { icon: 'skill_ice.png', name: 'Ice Blast' },
            { icon: 'skill_heal.png', name: 'Heal' },
            { icon: 'skill_shield.png', name: 'Shield' },
            { icon: 'skill_lightning.png', name: 'Lightning' },
            { icon: 'skill_buff.png', name: 'Buff' }
        ];
        // Y position: below equipment panel
        //createSkillBar(skills, 20, y + 110, this);
    }

    public async show() {
        this.menu.show();
    }

    public resize(width: number, height: number) {
        this.menu.resize(width, height);

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

        let statsLine = 120;

        this.statPanel.roundRect(210, statsLine, 260, 160, 10);
        this.statPanel.fill(0xE6E6E6);

        this.pointsLabel.x = 370;
        this.pointsLabel.y = statsLine + 15;
        this.pointsText.x = width - 100;
        this.pointsText.y = statsLine + 15;

        this.strLabel.x = 220;
        this.strLabel.y = statsLine + 45;
        this.strText.x = width - 200;
        this.strText.y = statsLine + 45;
        this.strMinusBtn.x = 400;
        this.strMinusBtn.y = statsLine + 45;
        this.strPlusBtn.x = 450;
        this.strPlusBtn.y = statsLine + 45;

        this.intLabel.x = 220;
        this.intLabel.y = statsLine + 75;
        this.intText.x = width - 200;
        this.intText.y = statsLine + 75;
        this.intMinusBtn.x = 400;
        this.intMinusBtn.y = statsLine + 75;
        this.intPlusBtn.x = 450;
        this.intPlusBtn.y = statsLine + 75;

        this.conLabel.x = 220;
        this.conLabel.y = statsLine + 105
        this.conText.x = width - 200;
        this.conText.y = statsLine + 105
        this.conMinusBtn.x = 400;
        this.conMinusBtn.y = statsLine + 105;
        this.conPlusBtn.x = 450;
        this.conPlusBtn.y = statsLine + 105;

        this.agiLabel.x = 220;
        this.agiLabel.y = statsLine + 135;
        this.agiText.x = width - 200;
        this.agiText.y = statsLine + 135;
        this.agiMinusBtn.x = 400;
        this.agiMinusBtn.y = statsLine + 135;
        this.agiPlusBtn.x = 450;
        this.agiPlusBtn.y = statsLine + 135;

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