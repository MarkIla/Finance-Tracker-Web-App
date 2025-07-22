import {
  Min,
  IsString,
  IsOptional,
  IsISO8601,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: string;

  @IsString()
  @IsOptional()
  currency?: string; 

  @IsString()
  source: string;

  @IsISO8601()
  receivedAt: string;           // ISO string

  @IsOptional()
  @IsString()
  note?: string;
}
