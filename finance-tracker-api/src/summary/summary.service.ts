import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';
import { Income } from '../income/income.entity';

interface RangeParams {
  month?: string; // 'YYYY-MM'
  year?: number;  // 2025
}

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Expense) private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Income)  private readonly incomeRepo:  Repository<Income>,
  ) {}

  /* --------------------------------------- */
  /* ---------- monthly breakdown ---------- */
  /* --------------------------------------- */
  async monthly(userId: string, month?: string) {
    const today = new Date();
    const [y, m] = month
      ? month.split('-').map(Number)
      : [today.getUTCFullYear(), today.getUTCMonth() + 1];

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end   = new Date(Date.UTC(y, m, 1));

    const expenseNum = await this.sumExpenses(userId, start, end);
    const incomeNum  = await this.sumIncomes(userId, start, end);

    const totalExpenseNum = await this.sumExpenses(userId);
    const totalIncomeNum  = await this.sumIncomes(userId);

    return {
      month: `${y}-${String(m).padStart(2, '0')}`,
      /* month subtotals */
      incomeTotal: incomeNum,
      expenseTotal: expenseNum,
      monthlyBalance: +(incomeNum - expenseNum).toFixed(2),
      /* running totals */
      totalIncome: totalIncomeNum,
      totalExpense: totalExpenseNum,
      totalBalance: +(totalIncomeNum - totalExpenseNum).toFixed(2),
    };
  }


   /* ----------------------------------------- */
   /* ---------- category breakdowns ---------- */
   /* ----------------------------------------- */
  async categoryBreakdown(userId: string, opts: RangeParams = {}) {
    const { month, year } = opts;

    /* ---------- validate ---------- */
    if (month && year !== undefined) {
      throw new BadRequestException('Provide either month OR year, not both');
    }

    /* ---------- derive range ---------- */
    let label: string;
    let start: Date;
    let end: Date;

    if (month) {
      const [y, m] = month.split('-').map(Number);
      label = month;
      start = new Date(Date.UTC(y, m - 1, 1));
      end   = new Date(Date.UTC(y, m, 1));
    } else {
      const today = new Date();
      const y = year ?? today.getUTCFullYear();
      label = y.toString();
      start = new Date(Date.UTC(y, 0, 1));
      end   = y === today.getUTCFullYear()
                ? today
                : new Date(Date.UTC(y + 1, 0, 1));
    }

    /* ---------- fetch per-category totals ---------- */
    const rows = await this.expenseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .where('e."userId" = :uid', { uid: userId })
      .andWhere('e."incurredAt" >= :start AND e."incurredAt" < :end', { start, end })
      .groupBy('e.category')
      .orderBy('total', 'DESC')
      .getRawMany<{ category: string; total: string }>();

    const total = rows.reduce((sum, r) => sum + Number(r.total), 0);

    return {
      range: label,
      grandTotal: +total.toFixed(2),
      categories: rows.map(r => ({
        category : r.category,
        total    : Number(r.total),
        percent  : total === 0 ? 0 : +((Number(r.total) / total) * 100).toFixed(2), // 2-dp %
      })),
    };
  }

   /* ----------------------------------------- */
   /* ---------- year-to-date totals ---------- */
   /* ----------------------------------------- */
  async yearToDate(userId: string, year?: number) {
    const today = new Date();
    const y = year ?? today.getUTCFullYear();

    const start = new Date(Date.UTC(y, 0, 1));
    const end   = y === today.getUTCFullYear()
                    ? today
                    : new Date(Date.UTC(y + 1, 0, 1));

    const expense = await this.sumExpenses(userId, start, end);
    const income  = await this.sumIncomes(userId, start, end);

    return {
      year: y,
      income,
      expense,
      balance: +(income - expense).toFixed(2),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  --- HELPER METHODS (private) ---                                   */
  /* ------------------------------------------------------------------ */
  private async sumExpenses(userId: string, from?: Date, to?: Date) {
    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount),0)', 'sum')
      .where('e."userId" = :uid', { uid: userId });

    if (from && to) {
      qb.andWhere('e."incurredAt" >= :from AND e."incurredAt" < :to', { from, to });
    }

    const { sum } = await qb.getRawOne<{ sum: string }>();
    return Number(sum);
  }

  private async sumIncomes(userId: string, from?: Date, to?: Date) {
    const qb = this.incomeRepo
      .createQueryBuilder('i')
      .select('COALESCE(SUM(i.amount),0)', 'sum')
      .where('i."userId" = :uid', { uid: userId });

    if (from && to) {
      qb.andWhere('i."receivedAt" >= :from AND i."receivedAt" < :to', { from, to });
    }

    const { sum } = await qb.getRawOne<{ sum: string }>();
    return Number(sum);
  }
}
