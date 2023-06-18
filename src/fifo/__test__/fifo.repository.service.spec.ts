import { Test, TestingModule } from '@nestjs/testing';
import { FifoRepository } from '../fifo.repository.service';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';
import { FifoService } from '../fifo.service';
import { FifoGateway } from '../fifo.gateway';

describe('FifoRepository', () => {
  let repository: FifoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FifoService,
        FifoValidationService,
        {
          provide: FifoRepository,
          useFactory: (fifoValidationService: FifoValidationService) =>
            new FifoRepository(
              [{ id: 'A', maxCredit: 20, credit: 20 }],
              [],
              fifoValidationService,
            ),

          inject: [FifoValidationService],
        },
        FifoGateway,
      ],
    }).compile();

    repository = module.get<FifoRepository>(FifoRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the FIFO queue', () => {
    const fifoQueue = repository.getFifoQueue();

    expect(fifoQueue).toEqual([]);
  });

  it('should return the actions', () => {
    const actions = repository.getActions();

    expect(actions).toEqual([{ id: 'A', maxCredit: 20, credit: 20 }]);
  });

  it('should set the actions', () => {
    const newActions = [{ id: 'A', maxCredit: 20, credit: 20 }];

    const updatedActions = repository.setActions(newActions);

    expect(updatedActions).toEqual(newActions);
    expect((repository as any).actions).toEqual(newActions);
  });

  it('should set the FIFO queue', () => {
    const newFifoQueue = ['A'];

    const updatedFifoQueue = repository.setFifoQueue(newFifoQueue);

    expect(updatedFifoQueue).toEqual(newFifoQueue);
    expect((repository as any).fifoQueue).toEqual(newFifoQueue);
  });
});
