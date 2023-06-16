import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { FifoService } from './fifo.service';
import { FifoElementDto } from './dtos/fifo.dto';
import { FifoDashboardElement } from 'src/shared/fifo.type';

@Controller('fifo')
export class FifoController {
  constructor(private readonly fifoService: FifoService) {}
  private readonly logger: Logger = new Logger('fifoController');

  @Post('fifoElement')
  postFifoElement(@Body() body: FifoElementDto): string[] {
    return this.fifoService.addFifoQueueElement(body.fifoElement);
  }

  @Get('actions')
  getActions(): FifoDashboardElement[] {
    return this.fifoService.getActions();
  }

  @Get('fifoQueue')
  getFifoQueue(): string[] {
    return this.fifoService.getFifoQueue();
  }
}
