import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('summary')
export class SummaryController {
  constructor(private readonly service: SummaryService) {}

  /* GET /summary?month=YYYY-MM  — already exists */
  @Get()
  monthly(
    @CurrentUser() user: { id: string },
    @Query('month') month?: string,
  ) {
    return this.service.monthly(user.id, month);
  }

  /* GET /summary/categories?month=YYYY-MM | ?year=2025 */
  @Get('categories')
  categories(
    @CurrentUser() user: { id: string },
    @Query('month') month?: string,
    @Query('year')  year?: string,
  ) {
    return this.service.categoryBreakdown(user.id, {
      month,
      year: year ? Number(year) : undefined,
    });
   }

  /* GET /summary/ytd?year=2025 */
  @Get('ytd')
  ytd(
    @CurrentUser() user: { id: string },
    @Query('year') year?: string,
  ) {
    return this.service.yearToDate(user.id, year ? Number(year) : undefined);
  }
}