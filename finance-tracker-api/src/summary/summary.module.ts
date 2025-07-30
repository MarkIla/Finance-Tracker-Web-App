import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/expense/expense.entity';
import { Income } from 'src/income/income.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income])],
  providers: [SummaryService],
  controllers: [SummaryController, ConfigModule]
})
export class SummaryModule {}
