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
  @IsOptional()
  currency?: string; // keep it free-form for now

  @IsString()
  category: string;

  @IsISO8601()
  incurredAt: string; // ISO string; converted to Date in service

  @IsOptional()
  @IsString()
  note?: string;

  /** S3/R2 object key (optional) */
  @IsOptional()
  @IsString()
  receiptKey?: string;

  @IsOptional() 
  @IsString()
  receiptName?: string;
}
