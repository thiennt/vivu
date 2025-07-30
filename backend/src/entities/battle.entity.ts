import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Character } from './character.entity';
import { BattleHistory } from './battle-history.entity';

@Entity('battles')
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  character1_id: number;

  @Column({ type: 'int' })
  character2_id: number;

  @Column({ type: 'int', nullable: true })
  winner: number;

  @ManyToOne(() => Character, (character) => character.battlesAsCharacter1)
  @JoinColumn({ name: 'character1_id' })
  character1: Character;

  @ManyToOne(() => Character, (character) => character.battlesAsCharacter2)
  @JoinColumn({ name: 'character2_id' })
  character2: Character;

  @OneToMany(() => BattleHistory, (history) => history.battle)
  battleHistories: BattleHistory[];
}
