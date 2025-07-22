import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';   // adjust path if needed

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: string;                 // keep as string to avoid float rounding

  @Column({ default: 'PHP' })
  currency: string;

  @Column()
  category: string;

  @Column('timestamptz')
  incurredAt: Date;

  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true })
  receiptUrl?: string;

  @ManyToOne(() => User, (u) => u.expenses, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
