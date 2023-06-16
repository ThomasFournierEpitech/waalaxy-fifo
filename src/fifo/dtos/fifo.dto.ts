import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FifoElementDto {
  @IsNotEmpty()
  @IsString()
  fifoElement: string;
}

export class FifoQueueDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  fifoElements: [];
}

export class FifoActionDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  maxCredit: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  credit: number;

  @IsNotEmpty()
  @IsString()
  id: string;
}

export class FifoDashboardElementsDto {
  @ArrayNotEmpty()
  @IsArray()
  @ArrayUnique((fifoAction: FifoActionDto) => fifoAction.id)
  @ValidateNested({ each: true })
  @Type(() => FifoActionDto)
  dashboardActions: FifoActionDto[];
}
