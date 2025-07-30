import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'int', default: 0 })
  hp: number;

  @Column({ type: 'int', default: 0 })
  atk: number;

  @Column({ type: 'int', default: 0 })
  def: number;

  @Column({ type: 'int', default: 0 })
  crit_rate: number;

  @Column({ type: 'int', default: 0 })
  crit_damage: number;

  @Column({ type: 'int', default: 0 })
  magic_atk: number;

  @Column({ type: 'int', default: 0 })
  magic_def: number;

  @Column({ type: 'int', default: 0 })
  hit_rate: number;

  @Column({ type: 'int', default: 0 })
  dodge_rate: number;
}
