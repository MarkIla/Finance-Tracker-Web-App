import { Test, TestingModule } from '@nestjs/testing';
import { IncomeController }    from './income.controller';
import { IncomeService }      from './income.service';
import { CreateIncomeDto }    from './dto/create-income.dto';
import { UpdateIncomeDto }    from './dto/update-income.dto';
import { Income }             from './income.entity';

/* ─────────────────────────────────────────────────────────── */

describe('IncomeController', () => {
  let controller: IncomeController;

  const mockSvc = {
    create : jest.fn<Promise<Income>,      [CreateIncomeDto, string]>(),
    findAll: jest.fn<Promise<Income[]>,    [string, Record<string, any>]>(),
    update : jest.fn<Promise<void>,        [string, UpdateIncomeDto, string]>(),
    remove : jest.fn<Promise<void>,        [string, string]>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeController],
      providers  : [{ provide: IncomeService, useValue: mockSvc }],
    }).compile();

    controller = module.get(IncomeController);
  });

  afterEach(jest.resetAllMocks);

  /* ───────────── tests ───────────── */

  it('creates a record', async () => {
    const dto: CreateIncomeDto = {
      amount: '50000',
      currency: 'PHP',
      source: 'Salary',
      receivedAt: '2025-07-15T00:00:00Z',
    };

    mockSvc.create.mockResolvedValue({ id: 'inc1' } as unknown as Income);

    const res = await controller.create(dto, { id: 'uid' });

    expect(res).toEqual({ id: 'inc1' });
    expect(mockSvc.create).toHaveBeenCalledWith(dto, 'uid');
  });

  it('returns list', async () => {
    mockSvc.findAll.mockResolvedValue([{ id: 'inc1' }] as Income[]);

    const out = await controller.findAll({id: 'uid'}, '2025-07' );
    expect(out).toEqual([{ id: 'inc1' }]);
  });

  it('updates record', async () => {
    const dto: UpdateIncomeDto = { note: 'updated' };
    await controller.update('inc1', dto, { id: 'uid' });

    expect(mockSvc.update).toHaveBeenCalledWith('inc1', dto, 'uid');
  });

  it('removes record', async () => {
    await controller.remove('inc1', { id: 'uid' });
    expect(mockSvc.remove).toHaveBeenCalledWith('inc1', 'uid');
  });
});
