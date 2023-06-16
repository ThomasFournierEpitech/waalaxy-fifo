import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  FifoDashboardElement,
  FifoEvent,
  FifoEventsEnum,
  FifoPayloadRefund,
} from '../shared/fifo.type';
import { TWENTY_FOUR_HOURS, TWO_MINUTES } from '../shared/config/timeConstants';
import { FifoRepository } from './fifo-repository/fifo.repository.service';
import { FifoGateway } from './fifo.gateway';

@Injectable()
export class FifoService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly fifoRepository: FifoRepository,
    private readonly fifoGateway: FifoGateway,
  ) {}

  private readonly logger: Logger = new Logger('fifoService');
  private intervalIdRefunds: NodeJS.Timeout;
  private intervalIdPerformAction: NodeJS.Timeout;

  onModuleInit() {
    this.intervalIdPerformAction = this.launchPerformActionInterval();
    this.intervalIdRefunds = this.launchRefundsInterval();
  }

  onModuleDestroy() {
    clearInterval(this.intervalIdPerformAction);
    clearInterval(this.intervalIdRefunds);
  }

  public addFifoQueueElement(fifoElement: string): string[] {
    const updatedQueue = [...this.fifoRepository.getFifoQueue(), fifoElement];
    const returnValue = this.fifoRepository.setFifoQueue(updatedQueue);

    return returnValue;
  }

  public decreaseActionQueueElementByActionId(
    actionId: string,
  ): FifoDashboardElement[] {
    const actualActions = this.fifoRepository.getActions();
    let founded = false;
    const updatedAction = actualActions.map((prevAction) => {
      if (prevAction.id !== actionId) {
        return prevAction;
      }
      founded = true;
      return { ...prevAction, credit: prevAction.credit - 1 };
    });

    if (founded) {
      return this.fifoRepository.setActions(updatedAction);
    }
    return actualActions;
  }

  public removeActionQueueElementByActionId(actionId: string): string[] {
    const actualQueue = this.fifoRepository.getFifoQueue();
    const index = actualQueue.indexOf(actionId);
    const newFifoElements = [...actualQueue];

    if (index === -1) {
      return actualQueue;
    }
    newFifoElements.splice(index, 1);
    return this.fifoRepository.setFifoQueue(newFifoElements);
  }

  public getNextFifoElementIdToProceed(): string | undefined {
    const initialAction = this.fifoRepository.getActions();
    const initialFifoQueue = this.fifoRepository.getFifoQueue();
    return initialFifoQueue.find((actionId) => {
      const filteredAction = initialAction.find(
        (action) => action.id === actionId,
      );

      if (!filteredAction || filteredAction.credit === 0) {
        return false;
      }
      return true;
    });
  }

  public refundCredits(): FifoDashboardElement[] {
    const initialAction = this.fifoRepository.getActions();

    return this.fifoRepository.setActions(
      initialAction.map((action: any) => {
        return {
          ...action,
          credit: Math.floor(
            Math.random() * (action.maxCredit * 0.2) + action.maxCredit * 0.8,
          ),
        };
      }),
    );
  }

  public performAction(): string[] {
    const fifoElementId = this.getNextFifoElementIdToProceed();

    if (fifoElementId === undefined) {
      return this.fifoRepository.getFifoQueue();
    }
    this.decreaseActionQueueElementByActionId(fifoElementId);
    return this.removeActionQueueElementByActionId(fifoElementId);
  }

  public getFifoQueue(): string[] {
    return this.fifoRepository.getFifoQueue();
  }

  public getActions(): FifoDashboardElement[] {
    return this.fifoRepository.getActions();
  }

  handlePerformAction() {
    this.performAction();

    const event: FifoEvent = {
      type: FifoEventsEnum.PERFORM_ACITON,
      payload: {
        fifoElements: this.getFifoQueue(),
        actions: this.getActions(),
      },
    };
    this.fifoGateway.sendEventToClients(event);
  }

  handleRefund() {
    this.refundCredits();

    const event: FifoEvent = {
      type: FifoEventsEnum.REFUND,
      payload: { actions: this.getActions() } as FifoPayloadRefund,
    };
    this.fifoGateway.sendEventToClients(event);
  }

  launchPerformActionInterval() {
    return setInterval(() => {
      this.handlePerformAction();
    }, TWO_MINUTES);
  }

  launchRefundsInterval() {
    return setInterval(() => {
      this.handleRefund();
    }, TWENTY_FOUR_HOURS);
  }

  getFifoGateway() {
    return this.fifoGateway;
  }
}
