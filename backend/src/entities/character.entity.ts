import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Battle } from './battle.entity';
import { BattleHistory } from './battle-history.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'int', default: 0 })
  str: number;

  @Column({ type: 'int', default: 0 })
  int: number;

  @Column({ type: 'int', default: 0 })
  con: number;

  @Column({ type: 'int', default: 0 })
  agi: number;

  @Column({ type: 'int', default: 0 })
  luk: number;

  @Column({ type: 'int', default: 100 })
  hp: number;

  @Column({ type: 'int', default: 0 })
  atk: number;

  @Column({ type: 'int', default: 0 })
  def: number;

  @Column({ type: 'int', default: 0 })
  magic_atk: number;

  @Column({ type: 'int', default: 0 })
  magic_def: number;

  @Column({ type: 'int', default: 0 })
  res: number;

  @Column({ type: 'int', default: 0 })
  base_crit: number;

  @Column({ type: 'int', default: 0 })
  base_hit: number;

  @Column({ type: 'int', default: 0 })
  base_dodge: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  exp: number;

  @Column({ type: 'int', default: 0 })
  str_point: number;

  @Column({ type: 'int', default: 0 })
  int_point: number;

  @Column({ type: 'int', default: 0 })
  con_point: number;

  @Column({ type: 'int', default: 0 })
  agi_point: number;

  @Column({ type: 'int', default: 0 })
  luk_point: number;

  @OneToMany(() => Battle, (battle) => battle.character1)
  battlesAsCharacter1: Battle[];

  @OneToMany(() => Battle, (battle) => battle.character2)
  battlesAsCharacter2: Battle[];

  @OneToMany(() => BattleHistory, (history) => history.character)
  battleHistories: BattleHistory[];

  @OneToMany(() => BattleHistory, (history) => history.targetedCharacter)
  targetedBattleHistories: BattleHistory[];
}
