import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  async create(dto: CreateExpenseDto, userId: string) {
    const expense = this.repo.create({
      ...dto,
      incurredAt: new Date(dto.incurredAt),
      user: { id: userId } as any,
    });
    return this.repo.save(expense);
  }

  /** month = '2025-07' */
  async findAll(userId: string, month?: string) {
    if (!month) {
      return this.repo.find({ where: { user: { id: userId } } });
    }

    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));
    return this.repo.find({
      where: {
        user: { id: userId },
        incurredAt: Between(start, end),
      },
    });
  }

  async findOne(id: string, userId: string) {
    const exp = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!exp) throw new NotFoundException();
    return exp;
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
    const exp = await this.findOne(id, userId);
    Object.assign(exp, dto);
    if (dto.incurredAt) exp.incurredAt = new Date(dto.incurredAt);
    return this.repo.save(exp);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // throws if not found/owner mismatch
    await this.repo.delete(id);
    return { deleted: true };
  }
}
