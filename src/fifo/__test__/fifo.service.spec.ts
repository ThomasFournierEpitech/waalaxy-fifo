import { Test } from '@nestjs/testing';
import { FifoService } from '../fifo.service';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';
import { FifoRepository } from '../fifo-repository/fifo.repository.service';
import { FifoEventsEnum } from '../../shared/fifo.type';
import {
  TWENTY_FOUR_HOURS,
  TWO_MINUTES,
} from '../../shared/config/timeConstants';
import { FifoGateway } from '../fifo.gateway';

let fifoService: FifoService;
let fifoRepository: FifoRepository;
let fifoGateway: FifoGateway;

beforeEach(async () => {
  const moduleRef = await Test.createTestingModule({
    providers: [
      FifoService,
      FifoValidationService,
      {
        provide: FifoRepository,
        useFactory: (fifoValidationService: FifoValidationService) =>
          new FifoRepository(
            [{ id: '1', maxCredit: 20, credit: 20 }],
            [],
            fifoValidationService,
          ),

        inject: [FifoValidationService],
      },
      FifoGateway,
    ],
  }).compile();
  fifoService = moduleRef.get<FifoService>(FifoService);
  fifoGateway = moduleRef.get<FifoGateway>(FifoGateway);
  fifoRepository = moduleRef.get<FifoRepository>(FifoRepository);
  fifoRepository.setFifoQueue = jest
    .fn()
    .mockImplementation((updatedFifoQueue) => updatedFifoQueue);
  fifoRepository.setActions = jest
    .fn()
    .mockImplementation((updatedActions) => updatedActions);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

describe('lifecycle', () => {
  it('should create intervals on module initialization', () => {
    jest.spyOn(global, 'clearInterval');

    // Act
    fifoService.onModuleInit();

    // Assert
    expect(fifoService['intervalIdPerformAction']).toBeDefined();
    expect(fifoService['intervalIdRefunds']).toBeDefined();

    fifoService.onModuleDestroy();
  });

  it('should not clearInterval called for intervalIdPerformAction and intervalIdRefunds on onModuleInit', () => {
    jest.spyOn(global, 'clearInterval');

    // Act
    fifoService.onModuleInit();

    // Assert
    expect(clearInterval).not.toHaveBeenCalledWith(
      fifoService['intervalIdPerformAction'],
    );
    expect(clearInterval).not.toHaveBeenCalledWith(
      fifoService['intervalIdRefunds'],
    );

    fifoService.onModuleDestroy();
  });

  it('should clearInterval called for intervalIdPerformAction and intervalIdRefunds on onModuleDestroy', () => {
    jest.spyOn(global, 'clearInterval');

    // Act
    fifoService.onModuleInit();
    fifoService.onModuleDestroy();

    // Assert
    expect(clearInterval).toHaveBeenCalledWith(
      fifoService['intervalIdPerformAction'],
    );
    expect(clearInterval).toHaveBeenCalledWith(
      fifoService['intervalIdRefunds'],
    );
  });
});

describe('addFifoQueueElement', () => {
  it('should add fifoElement to an empty fifoQueue and call setFifoQueue to update repository state and return the updated value', () => {
    const fifoElement = 'B';
    const mockFifoQueue = [fifoElement];

    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce([]);

    // Act
    const result = fifoService.addFifoQueueElement(fifoElement);

    // Assert
    expect(fifoRepository.setFifoQueue).toHaveBeenCalledWith(mockFifoQueue);
    expect(result).toEqual(mockFifoQueue);
  });

  it('should add fifoElement to the end of fifoQueue and call setFifoQueue to update repository state and return the updated value', () => {
    // Arrange
    const initFifoElement = 'A';
    const fifoElement = 'B';
    const mockFifoQueue = [initFifoElement, fifoElement];

    fifoRepository.getFifoQueue = jest
      .fn()
      .mockReturnValueOnce([initFifoElement]);

    // Act
    const result = fifoService.addFifoQueueElement(fifoElement);

    // Assert
    expect(fifoRepository.setFifoQueue).toHaveBeenCalledWith(mockFifoQueue);
    expect(result).toEqual(mockFifoQueue);
  });

  it('should add fifoElement to the end of fifoQueue even if credit is zero and call setFifoQueue to update repository state and return the updated value', () => {
    // Arrange
    const initFifoElement = 'A';
    const fifoElement = 'B';
    const mockFifoQueue = [initFifoElement, fifoElement];

    fifoRepository.getFifoQueue = jest
      .fn()
      .mockReturnValueOnce([initFifoElement]);

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 0 },
    ];
    // Act
    const result = fifoService.addFifoQueueElement(fifoElement);

    // Assert
    expect(fifoRepository.setFifoQueue).toHaveBeenCalledWith(mockFifoQueue);
    expect(result).toEqual(mockFifoQueue);
  });
});

describe('decreaseActionQueueElementByActionId', () => {
  it('should decrease the credit of the corresponding action by 1 and call setActions to update repository state and return the updated actions', () => {
    // Arrange
    const actionId = 'A';
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];

    const expectedActions = [
      { id: 'A', maxCredit: 20, credit: 19 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);

    // Act
    const result = fifoService.decreaseActionQueueElementByActionId(actionId);

    // Assert
    expect(fifoRepository.setActions).toHaveBeenCalledWith(expectedActions);
    expect(result).toEqual(expectedActions);
  });

  it("should not decrease the credit of the corresponding action when the action doesnt exist in the dashboard's aciton", () => {
    // Arrange
    const actionId = 'D';
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];

    const expectedActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);

    // Act
    const result = fifoService.decreaseActionQueueElementByActionId(actionId);

    // Assert
    expect(fifoRepository.setActions).toHaveBeenCalledTimes(0);
    expect(result).toEqual(expectedActions);
  });
});

describe('removeActionQueueElementByActionId', () => {
  it('should remove the corresponding action from the FIFO queue and return the updated queue', () => {
    // Arrange
    const actionId = 'B';
    const initialQueue = ['A', 'B', 'C'];
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    const mockFifoQueue = ['A', 'C'];
    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.removeActionQueueElementByActionId(actionId);

    // Assert
    expect(fifoRepository.setFifoQueue).toHaveBeenCalledWith(mockFifoQueue);
    expect(result).toEqual(mockFifoQueue);
  });

  it('should not remove action from the FIFO queue because none exist with this id and return the actual queue', () => {
    // Arrange
    const actionId = 'Z';
    const initialQueue = ['A', 'B', 'C'];
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.removeActionQueueElementByActionId(actionId);

    // Assert
    expect(fifoRepository.setFifoQueue).toHaveBeenCalledTimes(0);
    expect(result).toEqual(initialQueue);
  });
});

describe('getNextFifoElementIdToProceed', () => {
  it('should return the next element ID to proceed if there is an action with available credit', () => {
    // Arrange
    const initialQueue = ['A', 'B', 'C'];
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 0 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    const expectedResult = 'B';

    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.getNextFifoElementIdToProceed();

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should return undefined if there are no actions with available credit', () => {
    // Arrange
    const initialQueue = ['A', 'B', 'C'];
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 0 },
      { id: 'B', maxCredit: 20, credit: 0 },
      { id: 'C', maxCredit: 30, credit: 0 },
    ];
    const expectedResult = undefined;

    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.getNextFifoElementIdToProceed();

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should return undefined when FifoQueue is empty', () => {
    // Arrange
    const initialQueue = [];
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 10 },
      { id: 'B', maxCredit: 20, credit: 10 },
      { id: 'C', maxCredit: 30, credit: 10 },
    ];
    const expectedResult = undefined;

    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.getNextFifoElementIdToProceed();

    // Assert
    expect(result).toEqual(expectedResult);
  });
});

describe('refundCredits', () => {
  it('should refund 100% credits based on maxCredit for all actions and return the updated actions', () => {
    // Arrange
    const initialActions = [
      { id: 'A', maxCredit: 20, credit: 10 },
      { id: 'B', maxCredit: 20, credit: 10 },
      { id: 'C', maxCredit: 30, credit: 10 },
    ];
    const expectedResult = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];

    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    jest.spyOn(global.Math, 'random').mockReturnValue(1);

    // Act
    const result = fifoService.refundCredits();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(fifoRepository.setActions).toHaveBeenCalledWith(expectedResult);
  });
});

describe('refundCredits', () => {
  it('should refund 80% credits based on maxCredit for all actions and return the updated actions', () => {
    // Arrange
    const initialActions = [
      { id: 'A', maxCredit: 100, credit: 10 },
      { id: 'B', maxCredit: 100, credit: 10 },
      { id: 'C', maxCredit: 20, credit: 10 },
    ];
    const expectedResult = [
      { id: 'A', maxCredit: 100, credit: 80 },
      { id: 'B', maxCredit: 100, credit: 80 },
      { id: 'C', maxCredit: 20, credit: 16 },
    ];

    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialActions);
    jest.spyOn(global.Math, 'random').mockReturnValue(0);

    // Act
    const result = fifoService.refundCredits();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(fifoRepository.setActions).toHaveBeenCalledWith(expectedResult);
  });
});

describe('performAction', () => {
  it('should perform the next action in the FIFO queue and return the updated queue', () => {
    // Arrange
    const fifoElementId = 'B';
    const initialQueue = ['A', 'B', 'C'];
    const expectedResult = ['A', 'C'];

    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);
    fifoService.getNextFifoElementIdToProceed = jest
      .fn()
      .mockReturnValueOnce(fifoElementId);
    fifoService.decreaseActionQueueElementByActionId = jest.fn();
    fifoService.removeActionQueueElementByActionId = jest
      .fn()
      .mockReturnValueOnce(expectedResult);

    // Act
    const result = fifoService.performAction();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(
      fifoService.decreaseActionQueueElementByActionId,
    ).toHaveBeenCalledWith(fifoElementId);
    expect(fifoService.removeActionQueueElementByActionId).toHaveBeenCalledWith(
      fifoElementId,
    );
  });

  it('should return the current queue if there is no action to perform', () => {
    // Arrange
    const initialQueue = ['A', 'B', 'C'];
    const fifoElementId = undefined;

    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);
    fifoService.getNextFifoElementIdToProceed = jest
      .fn()
      .mockReturnValueOnce(fifoElementId);

    fifoService.decreaseActionQueueElementByActionId = jest.fn();
    fifoService.removeActionQueueElementByActionId = jest.fn();

    // Act
    const result = fifoService.performAction();

    // Assert
    expect(result).toEqual(initialQueue);
    expect(
      fifoService.decreaseActionQueueElementByActionId,
    ).not.toHaveBeenCalled();
    expect(
      fifoService.removeActionQueueElementByActionId,
    ).not.toHaveBeenCalled();
  });
});

describe('getFifoQueue', () => {
  it('should return the current FIFO queue', () => {
    // Arrange
    const initialQueue = ['A', 'B', 'C'];
    fifoRepository.getFifoQueue = jest.fn().mockReturnValueOnce(initialQueue);

    // Act
    const result = fifoService.getFifoQueue();

    // Assert
    expect(result).toEqual(initialQueue);
    expect(fifoRepository.getFifoQueue).toHaveBeenCalledTimes(1);
  });
});

describe('getActions', () => {
  it('should return the current list of actions', () => {
    // Arrange
    const initialeActions = [
      { id: 'A', credit: 5, maxCredit: 10 },
      { id: 'B', credit: 3, maxCredit: 8 },
    ];
    fifoRepository.getActions = jest.fn().mockReturnValueOnce(initialeActions);

    // Act
    const result = fifoService.getActions();

    // Assert
    expect(result).toEqual(initialeActions);
    expect(fifoRepository.getActions).toHaveBeenCalledTimes(1);
  });
});

describe('handlePerformAction', () => {
  it('should perform the action, emit the PERFORM_ACTION event, and update SSE', () => {
    // Arrange
    const fifoQueue = ['A', 'B', 'C'];
    const actions = [
      { id: 'A', credit: 5, maxCredit: 10 },
      { id: 'B', credit: 3, maxCredit: 8 },
    ];

    fifoService.performAction = jest.fn().mockReturnValueOnce(fifoQueue);
    fifoService.getFifoQueue = jest.fn().mockReturnValueOnce(fifoQueue);
    fifoService.getActions = jest.fn().mockReturnValueOnce(actions);
    const sendEventToClientsSpy = jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementationOnce(() => null);

    // Act
    fifoService.handlePerformAction();

    // Assert
    expect(fifoService.performAction).toHaveBeenCalled();
    expect(fifoService.getFifoQueue).toHaveBeenCalled();
    expect(fifoService.getActions).toHaveBeenCalled();
    expect(sendEventToClientsSpy).toHaveBeenCalledWith({
      type: FifoEventsEnum.PERFORM_ACITON,
      payload: {
        fifoElements: fifoQueue,
        actions: actions,
      },
    });
  });
});

describe('handleRefund', () => {
  it('should call refundCredits and sendEventToClients', () => {
    //Arrange
    const refundCreditsSpy = jest.spyOn(fifoService, 'refundCredits');
    const sendEventToClientsSpy = jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementationOnce(() => null);

    //Act
    fifoService.handleRefund();

    //Assert
    expect(refundCreditsSpy).toHaveBeenCalled();
    expect(sendEventToClientsSpy).toHaveBeenCalledWith({
      type: FifoEventsEnum.REFUND,
      payload: {
        actions: expect.any(Array),
      },
    });
  });
  it('should refund credits, emit the REFUND event', () => {
    // Arrange
    const actions = [
      { id: 'A', credit: 5, maxCredit: 10 },
      { id: 'B', credit: 3, maxCredit: 8 },
    ];
    fifoService.refundCredits = jest.fn().mockReturnValueOnce(actions);
    fifoService.getActions = jest.fn().mockReturnValueOnce(actions);

    const sendEventToClientsSpy = jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementationOnce(() => null);

    // Act
    fifoService.handleRefund();

    // Assert
    expect(fifoService.refundCredits).toHaveBeenCalled();
    expect(fifoService.getActions).toHaveBeenCalled();
    expect(sendEventToClientsSpy).toHaveBeenCalledWith({
      type: FifoEventsEnum.REFUND,
      payload: { actions: actions },
    });
  });
});

describe('launchPerformActionInterval', () => {
  it('should launch perform action interval after 2 minutes', () => {
    jest.useFakeTimers();

    // Arrange
    const intervalId = fifoService.launchPerformActionInterval();
    fifoService.handlePerformAction = jest.fn();

    //Act
    jest.advanceTimersByTime(TWO_MINUTES);

    //Assert
    expect(fifoService.handlePerformAction).toHaveBeenCalledTimes(1);

    clearInterval(intervalId);
  });

  it('should launch perform action interval and call handlePerformAction 3 times', () => {
    jest.useFakeTimers();

    //Act
    const intervalId = fifoService.launchPerformActionInterval();
    fifoService.handlePerformAction = jest.fn();

    //Act
    jest.advanceTimersByTime(TWO_MINUTES);
    jest.advanceTimersByTime(TWO_MINUTES);
    jest.advanceTimersByTime(TWO_MINUTES);

    //Assert
    expect(fifoService.handlePerformAction).toHaveBeenCalledTimes(3);

    clearInterval(intervalId);
  });

  it('should  launch perform action  interval and call handlePerformAction 0 time when (2 minutes - 1 second) has passed', () => {
    jest.useFakeTimers();

    const intervalId = fifoService.launchPerformActionInterval();
    fifoService.handlePerformAction = jest.fn();

    jest.advanceTimersByTime(1000);

    expect(fifoService.handlePerformAction).toHaveBeenCalledTimes(0);

    clearInterval(intervalId);
  });

  it('should  launch perform action  interval and call handlePerformAction 0 time when 1 second has passed', () => {
    jest.useFakeTimers();

    const intervalId = fifoService.launchPerformActionInterval();
    fifoService.handlePerformAction = jest.fn();

    jest.advanceTimersByTime(TWO_MINUTES - 1000);

    expect(fifoService.handlePerformAction).toHaveBeenCalledTimes(0);

    clearInterval(intervalId);
  });
});

describe('launchRefundsInterval', () => {
  it('should launch refunds interval after 24 hours', () => {
    jest.useFakeTimers();

    //Act
    const intervalId = fifoService.launchRefundsInterval();
    fifoService.handleRefund = jest.fn();

    //Act
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);

    //Assert
    expect(fifoService.handleRefund).toHaveBeenCalledTimes(1);

    // Effacer l'intervalle
    clearInterval(intervalId);
  });

  it('should launch refunds interval and call handleRefund 3 times', () => {
    jest.useFakeTimers();

    const intervalId = fifoService.launchRefundsInterval();
    fifoService.handleRefund = jest.fn();

    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);

    expect(fifoService.handleRefund).toHaveBeenCalledTimes(3);

    clearInterval(intervalId);
  });

  it('should launch refunds interval and call handleRefund 0 time when (24 hours - 1 second) has passed', () => {
    jest.useFakeTimers();

    const intervalId = fifoService.launchRefundsInterval();
    fifoService.handleRefund = jest.fn();

    jest.advanceTimersByTime(1000);

    expect(fifoService.handleRefund).toHaveBeenCalledTimes(0);

    clearInterval(intervalId);
  });

  it('should launch refunds interval and call handleRefund 0 time when 1 second has passed', () => {
    jest.useFakeTimers();

    const intervalId = fifoService.launchRefundsInterval();
    fifoService.handleRefund = jest.fn();

    jest.advanceTimersByTime(TWENTY_FOUR_HOURS - 1000);

    expect(fifoService.handleRefund).toHaveBeenCalledTimes(0);

    clearInterval(intervalId);
  });
});
