import {
  Min,
  IsString,
  IsOptional,
  IsISO8601,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: string;

  @IsString()
  currency: string; // keep it free-form for now

  @IsString()
  category: string;

  @IsISO8601()
  incurredAt: string; // ISO string; converted to Date in service

  @IsOptional()
  @IsString()
  note?: string;
}
