import { Test, TestingModule } from '@nestjs/testing';
import { FifoController } from '../fifo.controller';
import { FifoService } from '../fifo.service';
import { FifoElementDto } from '../dtos/fifo.dto';
import { FifoDashboardElement } from '../../shared/fifo.type';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';
import { FifoRepository } from '../fifo-repository/fifo.repository.service';
import { FifoGateway } from '../fifo.gateway';

describe('FifoController', () => {
  let controller: FifoController;
  let fifoService: FifoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FifoController],
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

    controller = module.get<FifoController>(FifoController);
    fifoService = module.get<FifoService>(FifoService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postFifoElement', () => {
    it('should add a FIFO element and return the updated FIFO queue', () => {
      //Arrange
      const body: FifoElementDto = { fifoElement: 'A' };
      const expectedQueue = ['A', 'B', 'C'];
      jest
        .spyOn(fifoService, 'addFifoQueueElement')
        .mockReturnValue(expectedQueue);

      //Act
      const result = controller.postFifoElement(body);

      //Assert
      expect(result).toEqual(expectedQueue);
      expect(fifoService.addFifoQueueElement).toHaveBeenCalledWith('A');
    });
  });

  describe('getActions', () => {
    it('should return the actions', () => {
      //Arrange
      const expectedActions: FifoDashboardElement[] = [
        { id: 'A', maxCredit: 20, credit: 20 },
      ];
      jest.spyOn(fifoService, 'getActions').mockReturnValue(expectedActions);

      //Act
      const result = controller.getActions();

      //Assert
      expect(result).toEqual(expectedActions);
      expect(fifoService.getActions).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFifoQueue', () => {
    it('should return the FIFO queue', () => {
      //Arrange
      const expectedQueue = ['A', 'B', 'C'];
      jest.spyOn(fifoService, 'getFifoQueue').mockReturnValue(expectedQueue);

      //Act
      const result = controller.getFifoQueue();

      //Assert
      expect(result).toEqual(expectedQueue);
      expect(fifoService.getFifoQueue).toHaveBeenCalledTimes(1);
    });
  });
});
