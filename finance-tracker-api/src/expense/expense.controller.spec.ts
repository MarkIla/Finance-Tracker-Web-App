import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController }   from './expense.controller';
import { ExpenseService }     from './expense.service';
import { CreateExpenseDto }   from './dto/create-expense.dto';
import { UpdateExpenseDto }   from './dto/update-expense.dto';
import { Expense }            from './expense.entity';

/* ─────────────────────────────────────────────────────────── */

describe('ExpenseController', () => {
  let controller: ExpenseController;

  /* fully-typed mocked service */
  const mockSvc = {
    create : jest.fn<Promise<Expense>,  [CreateExpenseDto, string]>(),
    findAll: jest.fn<Promise<Expense[]>,[string, Record<string, any>]>(),
    update : jest.fn<Promise<void>,      [string, UpdateExpenseDto, string]>(),
    remove : jest.fn<Promise<void>,      [string, string]>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers  : [{ provide: ExpenseService, useValue: mockSvc }],
    }).compile();

    controller = module.get(ExpenseController);
  });

  afterEach(jest.resetAllMocks);

  /* ───────────── tests ───────────── */

  it('creates a record', async () => {
    const dto: CreateExpenseDto = {
      amount: '199.99',
      currency: 'PHP',
      category: 'Food',
      incurredAt: '2025-07-24T00:00:00Z',
    };

    mockSvc.create.mockResolvedValue({ id: 'exp1' } as unknown as Expense);

    const res = await controller.create(dto, { id: 'uid' });

    expect(res).toEqual({ id: 'exp1' });
    expect(mockSvc.create).toHaveBeenCalledWith(dto, 'uid');
  });

  it('returns list', async () => {
    mockSvc.findAll.mockResolvedValue([{ id: 'exp1' }] as Expense[]);

    const result = await controller.findAll({id: 'uid' }, '2025-07' );

    expect(result).toEqual([{ id: 'exp1' }]);
  });

  it('updates record', async () => {
    const dto: UpdateExpenseDto = { note: 'updated' };
    await controller.update('exp1', dto, { id: 'uid' });

    expect(mockSvc.update).toHaveBeenCalledWith('exp1', dto, 'uid');
  });

  it('removes record', async () => {
    await controller.remove('exp1', { id: 'uid' });
    expect(mockSvc.remove).toHaveBeenCalledWith('exp1', 'uid');
  });
});
