import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';   // adjust path if needed

@Entity()
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: string;              // DB-safe string, validated as number in DTO

  @Column({ default: 'PHP' })
  currency: string;

  @Column()
  source: string;              // e.g. “Salary”, “Freelance”, “Gift”

  @Column('timestamptz')
  receivedAt: Date;

  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true })
  receiptKey?: string;

  @Column({ nullable: true })
  receiptName?: string;

  @ManyToOne(() => User, (u) => u.incomes, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
