import { Injectable, Logger } from '@nestjs/common';
import { FifoDashboardElement } from '../../shared/fifo.type';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';

@Injectable()
export class FifoRepository {
  constructor(
    actionsInit: FifoDashboardElement[],
    fifoQueueInit: string[],
    private readonly fifoValidationService: FifoValidationService,
  ) {
    this.fifoValidationService.validateInitialeFifoValues(
      actionsInit,
      fifoQueueInit,
    );

    this.actions = actionsInit;
    this.fifoQueue = fifoQueueInit;
  }
  private readonly logger: Logger = new Logger('FifoRepository');
  private fifoQueue: string[];
  private actions: FifoDashboardElement[];

  public getFifoQueue(): string[] {
    return this.fifoQueue;
  }

  public getActions(): FifoDashboardElement[] {
    return this.actions;
  }
  public setActions(actions) {
    this.actions = actions;

    return this.actions;
  }

  public setFifoQueue(fifoQueue) {
    this.fifoQueue = fifoQueue;

    return this.fifoQueue;
  }
}
