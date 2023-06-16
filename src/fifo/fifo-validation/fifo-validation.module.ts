import { Module } from '@nestjs/common';
import { FifoValidationService } from './fifo-validation.service';

@Module({
  providers: [FifoValidationService],
})
export class FifoValidationModule {}
