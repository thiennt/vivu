import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Battle } from './battle.entity';
import { Character } from './character.entity';

@Entity('battle_histories')
export class BattleHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  battle_id: number;

  @Column({ type: 'int' })
  turn: number;

  @Column({ type: 'int' })
  character_id: number;

  @Column({ type: 'int' })
  targeted_character_id: number;

  @Column({ type: 'varchar', length: 255 })
  action_name: string;

  @Column({ type: 'boolean', default: false })
  is_missed: boolean;

  @Column({ type: 'int', default: 0 })
  damage: number;

  @ManyToOne(() => Battle, (battle) => battle.battleHistories)
  @JoinColumn({ name: 'battle_id' })
  battle: Battle;

  @ManyToOne(() => Character, (character) => character.battleHistories)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @ManyToOne(() => Character, (character) => character.targetedBattleHistories)
  @JoinColumn({ name: 'targeted_character_id' })
  targetedCharacter: Character;
}
