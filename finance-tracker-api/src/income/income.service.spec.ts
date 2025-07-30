import { Test } from '@nestjs/testing';
import { IncomeService } from './income.service';
import { Income } from './income.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { BadRequestException } from '@nestjs/common';

/* ── repository mock factory ────────────────────────── */
const repoFactory = () =>
  ({
    create: jest.fn(),
    save  : jest.fn(),
  } as unknown as jest.Mocked<Repository<Income>>);

describe('IncomeService', () => {
  let service: IncomeService;
  let repo:    jest.Mocked<Repository<Income>>;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        IncomeService,
        { provide: getRepositoryToken(Income), useFactory: repoFactory },
      ],
    }).compile();

    service = mod.get(IncomeService);
    repo    = mod.get(getRepositoryToken(Income));
  });

  /* ───────────────────────── tests ─────────────────── */

  const baseDto: CreateIncomeDto = {
    amount    : '50000',
    currency  : 'PHP',
    source    : 'Salary',
    receivedAt: '2025-07-15',
  };

  it('creates an income record', async () => {
    const saved: Income = { id: 'inc1', ...baseDto } as any;

    repo.create.mockReturnValue(saved);
    repo.save.mockResolvedValue(saved);

    const result = await service.create(baseDto, 'user123');
    expect(result).toEqual(saved);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...baseDto,
        receivedAt: new Date(baseDto.receivedAt),
        receiptKey: null,
        user      : { id: 'user123' },
      }),
    );
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
  
  it('throws if amount is negative', () => {
    expect(() =>
      service.create({ ...baseDto, amount: '-1.00' } as any, 'uid'),
    ).toThrow();
  });
});
