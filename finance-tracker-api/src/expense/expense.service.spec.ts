import { Test } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { Expense } from './expense.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';

/* ── helper to build a mock TypeORM repository ───────── */
const repoFactory = () =>
  ({
    create: jest.fn(),
    save  : jest.fn(),
  } as unknown as jest.Mocked<Repository<Expense>>);

describe('ExpenseService', () => {
  let service: ExpenseService;
  let repo:    jest.Mocked<Repository<Expense>>;

  /* ─────────────────────────────────────────────────── */
  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: getRepositoryToken(Expense), useFactory: repoFactory },
      ],
    }).compile();

    service = mod.get(ExpenseService);
    repo    = mod.get(getRepositoryToken(Expense));
  });

  /* ───────────────────────── tests ─────────────────── */

  const baseDto: CreateExpenseDto = {
    amount    : '199.99',
    currency  : 'PHP',
    category  : 'Food',
    incurredAt: '2025-07-24',
  };

  it('creates an expense and returns it', async () => {
    /* what the repository will resolve with */
    const saved: Expense = { id: 'exp1', ...baseDto } as any;

    repo.create.mockReturnValue(saved);
    repo.save.mockResolvedValue(saved);

    const result = await service.create(baseDto, 'user-id-abc');
    expect(result).toEqual(saved);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...baseDto,
        incurredAt: new Date(baseDto.incurredAt),
        receiptKey : null,
        user       : { id: 'user-id-abc' },
      }),
    );
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  // it('throws if amount is negative', () => {
  //   expect(() =>
  //     service.create({ ...baseDto, amount: '-1.00' } as any, 'uid'),
  //   ).toThrow();
  // });
});
