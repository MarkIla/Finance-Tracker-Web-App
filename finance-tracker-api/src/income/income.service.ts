import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Income } from './income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';


@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly repo: Repository<Income>,
  ) {}

  /* -------------------- CREATE -------------------- */
  create(dto: CreateIncomeDto, userId: string) {
    const income = this.repo.create({
      ...dto,
      receivedAt: new Date(dto.receivedAt),
      receiptUrl: dto.receiptKey ?? null,
      user: { id: userId } as any,
    });
    return this.repo.save(income);
  }

  /* -------------------- READ -------------------- */
  findAll(userId: string, month?: string) {
    if (!month) return this.repo.find({ where: { user: { id: userId } } });

    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end   = new Date(Date.UTC(y, m, 1));
    return this.repo.find({
      where: {
        user: { id: userId },
        receivedAt: Between(start, end),
      },
    });
  }

  async findOne(id: string, userId: string) {
    const inc = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!inc) throw new NotFoundException();
    return inc;
  }

  /* -------------------- UPDATE -------------------- */
  async update(id: string, dto: UpdateIncomeDto, userId: string) {
    const inc = await this.findOne(id, userId);
    Object.assign(inc, dto);
    if (dto.receivedAt) inc.receivedAt = new Date(dto.receivedAt);
    if (dto.receiptKey !== undefined) inc.receiptUrl = dto.receiptKey || null;
    return this.repo.save(inc);
  }

  /* -------------------- DELETE -------------------- */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.repo.delete(id);
    return { deleted: true };
  }
}
