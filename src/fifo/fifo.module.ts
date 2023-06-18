import { Module } from '@nestjs/common';
import { FifoService } from './fifo.service';
import { FifoController } from './fifo.controller';
import { FifoValidationService } from './fifo-validation/fifo-validation.service';
import { FifoRepository } from './fifo.repository.service';
import { initialeActions } from '../shared/config/initialActions';
import { initialeFifoElements } from '../shared/config/initialFifoElements';
import { FifoValidationModule } from './fifo-validation/fifo-validation.module';
import { FifoGateway } from './fifo.gateway';

@Module({
  controllers: [FifoController],
  providers: [
    FifoService,
    FifoValidationService,
    {
      provide: FifoRepository,
      useFactory: (fifoValidationService: FifoValidationService) =>
        new FifoRepository(
          initialeActions,
          initialeFifoElements,
          fifoValidationService,
        ),
      inject: [FifoValidationService],
    },
    FifoGateway,
  ],
  imports: [FifoValidationModule],
})
export class FifoModule {}
