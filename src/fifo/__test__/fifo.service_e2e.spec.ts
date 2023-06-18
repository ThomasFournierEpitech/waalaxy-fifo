import { Test } from '@nestjs/testing';
import { FifoService } from '../fifo.service';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';
import { FifoRepository } from '../fifo-repository/fifo.repository.service';
import {
  TWENTY_FOUR_HOURS,
  TWO_MINUTES,
} from '../../shared/config/timeConstants';
import { FifoGateway } from '../fifo.gateway';
import { FifoController } from '../fifo.controller';

let fifoService: FifoService;
let fifoRepository: FifoRepository;
let fifoGateway: FifoGateway;
let fifoController: FifoController;

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
    controllers: [FifoController],
  }).compile();
  fifoController = moduleRef.get<FifoController>(FifoController);
  fifoService = moduleRef.get<FifoService>(FifoService);
  fifoGateway = moduleRef.get<FifoGateway>(FifoGateway);
  fifoRepository = moduleRef.get<FifoRepository>(FifoRepository);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

describe('test E2E', () => {
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
      controllers: [FifoController],
    }).compile();
    fifoController = moduleRef.get<FifoController>(FifoController);
    fifoService = moduleRef.get<FifoService>(FifoService);
    fifoGateway = moduleRef.get<FifoGateway>(FifoGateway);
    fifoRepository = moduleRef.get<FifoRepository>(FifoRepository);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  it('test waalaxy part 1', () => {
    //Act

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 18 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ];
    fifoRepository['fifoQueue'] = [];

    //Act
    const intervalRefundsId = fifoService.launchRefundsInterval();
    const intervalPerformActionId = fifoService.launchPerformActionInterval();
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });

    //Assert

    expect(fifoRepository['fifoQueue']).toEqual([
      'A',
      'A',
      'B',
      'B',
      'B',
      'B',
      'B',
      'C',
      'C',
      'A',
      'A',
    ]);

    // // Effacer l'intervalle
    clearInterval(intervalRefundsId);
    clearInterval(intervalPerformActionId);
  });

  it('test waalaxy part 2', () => {
    jest.useFakeTimers();

    // Act;
    jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementationOnce(() => null);

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 18 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ];
    fifoRepository['fifoQueue'] = [];

    //Act
    const intervalRefundsId = fifoService.launchRefundsInterval();
    const intervalPerformActionId = fifoService.launchPerformActionInterval();
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    jest.advanceTimersByTime(TWO_MINUTES);

    //Assert
    expect(fifoRepository['fifoQueue']).toEqual([
      'A',
      'B',
      'B',
      'B',
      'B',
      'B',
      'C',
      'C',
      'A',
      'A',
    ]);
    expect(fifoRepository['actions']).toEqual([
      { id: 'A', maxCredit: 20, credit: 17 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ]);

    // // Effacer l'intervalle
    clearInterval(intervalRefundsId);
    clearInterval(intervalPerformActionId);
  });

  it('test waalaxy part 2', () => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(1);
    jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementation(() => null);

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 18 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ];
    fifoRepository['fifoQueue'] = [];

    //Act
    const intervalRefundsId = fifoService.launchRefundsInterval();
    const intervalPerformActionId = fifoService.launchPerformActionInterval();
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    jest.advanceTimersByTime(TWO_MINUTES);

    //Assert
    expect(fifoRepository['fifoQueue']).toEqual([
      'A',
      'B',
      'B',
      'B',
      'B',
      'B',
      'C',
      'C',
      'A',
      'A',
    ]);
    expect(fifoRepository['actions']).toEqual([
      { id: 'A', maxCredit: 20, credit: 17 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ]);

    // // Effacer l'intervalle
    clearInterval(intervalRefundsId);
    clearInterval(intervalPerformActionId);
  });

  it('test waalaxy with refunds', () => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(1);
    jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementation(() => null);

    //Act

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 18 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ];
    fifoRepository['fifoQueue'] = [];

    //Act
    const intervalRefundsId = fifoService.launchRefundsInterval();
    const intervalPerformActionId = fifoService.launchPerformActionInterval();
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);

    //Assert
    expect(fifoRepository['fifoQueue']).toEqual([]);
    expect(fifoRepository['actions']).toEqual([
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ]);

    // // Effacer l'intervalle
    clearInterval(intervalRefundsId);
    clearInterval(intervalPerformActionId);
  });

  it('test waalaxy with multiple refunds and multiple perform Action', () => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(1);

    //Act
    jest
      .spyOn(fifoGateway, 'sendEventToClients')
      .mockImplementation(() => null);

    fifoRepository['actions'] = [
      { id: 'A', maxCredit: 20, credit: 18 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ];
    fifoRepository['fifoQueue'] = [];

    //Act
    const intervalRefundsId = fifoService.launchRefundsInterval();
    const intervalPerformActionId = fifoService.launchPerformActionInterval();
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'B' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);
    fifoController.postFifoElement({ fifoElement: 'C' });
    jest.advanceTimersByTime(TWENTY_FOUR_HOURS);

    fifoController.postFifoElement({ fifoElement: 'C' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    fifoController.postFifoElement({ fifoElement: 'A' });
    jest.advanceTimersByTime(TWO_MINUTES);
    jest.advanceTimersByTime(TWO_MINUTES);
    fifoController.postFifoElement({ fifoElement: 'A' });

    //Assert
    expect(fifoRepository['fifoQueue']).toEqual(['A', 'A']);
    expect(fifoRepository['actions']).toEqual([
      { id: 'A', maxCredit: 20, credit: 19 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 29 },
    ]);

    // // Effacer l'intervalle
    clearInterval(intervalRefundsId);
    clearInterval(intervalPerformActionId);
  });
});
