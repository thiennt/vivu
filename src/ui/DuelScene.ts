import { Container, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { waitFor } from '../utils/asyncUtils';
import { navigation } from '../utils/navigation';

import { Player } from './Player';
import { Enemy } from './Enemy';
import { StatsArea } from './StatsArea';


export class DuelScene extends Container {
    private duelContainer: Container;
    private statsContainer: Container;
    private player: Player;
    private enemy: Enemy;
    private statsArea: StatsArea;

    private battleHistory: any[] = [];

    private currentTurn = 0;

    constructor() {
        super();

        this.duelContainer = new Container();
        this.addChild(this.duelContainer);

        this.player = new Player();
        this.duelContainer.addChild(this.player);

        this.enemy = new Enemy();
        this.duelContainer.addChild(this.enemy);

        this.statsContainer = new Container();
        this.addChild(this.statsContainer);

        this.statsArea = new StatsArea();
        this.statsContainer.addChild(this.statsArea);

        this.battleHistory = [
            { turn: 1, character_id: this.player, targeted_character_id: this.enemy, action_name: 'fight', is_missed: false, damage: 1 },
            { turn: 2, character_id: this.enemy, targeted_character_id: this.player, action_name: 'crit', is_missed: false, damage: 7 },
            { turn: 3, character_id: this.player, targeted_character_id: this.enemy, action_name: 'fight', is_missed: false, damage: 1 },
            { turn: 4, character_id: this.enemy, targeted_character_id: this.player, action_name: 'fight', is_missed: false, damage: 1 },
            { turn: 5, character_id: this.player, targeted_character_id: this.enemy, action_name: 'crit', is_missed: false, damage: 6 },
            { turn: 6, character_id: this.enemy, targeted_character_id: this.player, action_name: 'fight', is_missed: false, damage: 1 },
            { turn: 7, character_id: this.player, targeted_character_id: this.enemy, action_name: 'crit', is_missed: false, damage: 6 },
            { turn: 8, character_id: this.enemy, targeted_character_id: this.player, action_name: 'fight', is_missed: false, damage: 1 },
            { turn: 9, character_id: this.player, targeted_character_id: this.enemy, action_name: 'crit', is_missed: false, damage: 6 },
            { turn: 10, character_id: this.enemy, targeted_character_id: this.player, action_name: 'crit', is_missed: false, damage: 7 },
        ];
    }

    public async show() {
        await waitFor(1);
        this.startBattle();
    }

    public async hide() {
        this.duelContainer.removeChildren();
        this.statsContainer.removeChildren();
        this.removeChild(this.duelContainer);
        this.removeChild(this.statsContainer);
        
        this.battleHistory = [];
        this.currentTurn = 100;
    }

    public async startBattle() {
        if (this.currentTurn >= this.battleHistory.length) return;

        const action = this.battleHistory[this.currentTurn];
        console.log(`Turn ${action.turn}: ${action.character_id === this.player ? 'Player' : 'Enemy'} performs ${action.action_name} on ${action.targeted_character_id === this.player ? 'Player' : 'Enemy'} with damage ${action.damage}`);

        if (action.character_id === this.player) {
            gsap.to(this.player, { x: this.player.x + 70, duration: 0.1, ease: 'power1.out', onComplete: () => {
                if (action.action_name === 'crit') {
                    this.player.doCrit(this.nextPlayerTurn.bind(this, action));
                } else {
                    this.player.doFight(this.nextPlayerTurn.bind(this, action));
                }
            }});
        } else {
            gsap.to(this.enemy, { x: this.enemy.x - 70, duration: 0.1, ease: 'back.out', onComplete: () => {
                if (action.action_name === 'crit') {
                    this.enemy.doCrit(this.nextEnemyTurn.bind(this, action));
                }
                else {
                    this.enemy.doFight(this.nextEnemyTurn.bind(this, action));
                }
            }});   
        }
    }

    public async nextPlayerTurn(action: any) {
        this.player.x -= 70;
        this.player.idle();
        this.enemy.stats.hp -= action.damage;
        this.currentTurn += 1;
        this.statsArea.updateHp();
        await waitFor(1);
        this.startBattle();
    }

    public async nextEnemyTurn(action: any) {
        this.enemy.x += 70;
        this.enemy.idle();
        this.player.stats.hp -= action.damage;
        this.currentTurn += 1;
        this.statsArea.updateHp();
        await waitFor(1);
        this.startBattle();
    }

    public prepare() {
        this.statsArea.prepare(this.player, this.enemy);
    }

    public resize(width: number, height: number) {
        const centerX = width * 0.5;

        this.player.x = centerX - 60;
        this.player.y = -42;
        this.enemy.x = centerX + 60;
        this.enemy.y = -50;
        
        this.statsContainer.x = 0;
        this.statsContainer.y = -450;

        this.statsArea.resize(width, height);
    }

    public update(time: Ticker) {
        
    }
}
