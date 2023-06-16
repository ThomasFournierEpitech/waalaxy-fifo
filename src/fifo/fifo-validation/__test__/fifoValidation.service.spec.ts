import { Test, TestingModule } from '@nestjs/testing';
import { FifoValidationService } from '../fifo-validation.service';
import { initialeActions } from '../../../shared/config/initialActions';
import { initialeFifoElements } from '../../../shared/config/initialFifoElements';

describe('fifoValidation', () => {
  let validationService: FifoValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FifoValidationService],
    }).compile();

    validationService = module.get<FifoValidationService>(
      FifoValidationService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  it('should return true if validation passes', () => {
    const result = validationService.validateInitialeFifoValues(
      [
        { id: 'A', maxCredit: 20, credit: 20 },
        { id: 'B', maxCredit: 20, credit: 20 },
        { id: 'C', maxCredit: 30, credit: 30 },
      ],
      ['A'],
    );

    expect(result).toBe(true);
  });

  it('should throw Error if validation fail', () => {
    expect(() =>
      validationService.validateInitialeFifoValues(
        [
          { id: 'A', maxCredit: -20, credit: 20 },
          { id: 'B', maxCredit: 20, credit: 20 },
          { id: 'C', maxCredit: 30, credit: 30 },
        ],
        ['A'],
      ),
    ).toThrow(Error);
  });

  it('should extract validation errors correctly with 1 error', () => {
    const errors = [
      {
        target: {
          dashboardActions: [
            {
              id: 'A',
              maxCredit: -20,
              credit: 20,
            },
            {
              id: 'B',
              maxCredit: 20,
              credit: 20,
            },
            {
              id: 'C',
              maxCredit: 30,
              credit: 30,
            },
          ],
        },
        value: [
          {
            id: 'A',
            maxCredit: -20,
            credit: 20,
          },
          {
            id: 'B',
            maxCredit: 20,
            credit: 20,
          },
          {
            id: 'C',
            maxCredit: 30,
            credit: 30,
          },
        ],
        property: 'dashboardActions',
        children: [
          {
            target: [
              {
                id: 'A',
                maxCredit: -20,
                credit: 20,
              },
              {
                id: 'B',
                maxCredit: 20,
                credit: 20,
              },
              {
                id: 'C',
                maxCredit: 30,
                credit: 30,
              },
            ],
            value: {
              id: 'A',
              maxCredit: -20,
              credit: 20,
            },
            property: '0',
            children: [
              {
                target: {
                  id: 'A',
                  maxCredit: -20,
                  credit: 20,
                },
                value: -20,
                property: 'maxCredit',
                children: [],
                constraints: {
                  isPositive: 'maxCredit must be a positive number',
                },
              },
            ],
          },
        ],
      },
    ];

    const validationErrors = validationService.extractValidationErrors(errors);
    expect(validationErrors).toStrictEqual([
      'dashboardActions.0.maxCredit: maxCredit must be a positive number',
    ]);
  });

  it('should extract validation errors correctly with multiple errors', () => {
    const errors = [
      {
        target: {
          dashboardActions: [
            {
              id: 'A',
              maxCredit: -20,
              credit: 20,
            },
            {
              id: '',
              maxCredit: -20,
              credit: 20,
            },
            {
              id: 'C',
              maxCredit: 30,
              credit: 30,
            },
          ],
        },
        value: [
          {
            id: 'A',
            maxCredit: -20,
            credit: 20,
          },
          {
            id: '',
            maxCredit: -20,
            credit: 20,
          },
          {
            id: 'C',
            maxCredit: 30,
            credit: 30,
          },
        ],
        property: 'dashboardActions',
        children: [
          {
            target: [
              {
                id: 'A',
                maxCredit: -20,
                credit: 20,
              },
              {
                id: '',
                maxCredit: -20,
                credit: 20,
              },
              {
                id: 'C',
                maxCredit: 30,
                credit: 30,
              },
            ],
            value: {
              id: 'A',
              maxCredit: -20,
              credit: 20,
            },
            property: '0',
            children: [
              {
                target: {
                  id: 'A',
                  maxCredit: -20,
                  credit: 20,
                },
                value: -20,
                property: 'maxCredit',
                children: [],
                constraints: {
                  isPositive: 'maxCredit must be a positive number',
                },
              },
            ],
          },
          {
            target: [
              {
                id: 'A',
                maxCredit: -20,
                credit: 20,
              },
              {
                id: '',
                maxCredit: -20,
                credit: 20,
              },
              {
                id: 'C',
                maxCredit: 30,
                credit: 30,
              },
            ],
            value: {
              id: '',
              maxCredit: -20,
              credit: 20,
            },
            property: '1',
            children: [
              {
                target: {
                  id: '',
                  maxCredit: -20,
                  credit: 20,
                },
                value: -20,
                property: 'maxCredit',
                children: [],
                constraints: {
                  isPositive: 'maxCredit must be a positive number',
                },
              },
              {
                target: {
                  id: '',
                  maxCredit: -20,
                  credit: 20,
                },
                value: '',
                property: 'id',
                children: [],
                constraints: {
                  isNotEmpty: 'id should not be empty',
                },
              },
            ],
          },
        ],
      },
    ];

    const validationErrors = validationService.extractValidationErrors(errors);
    expect(validationErrors).toStrictEqual([
      'dashboardActions.0.maxCredit: maxCredit must be a positive number',
      'dashboardActions.1.maxCredit: maxCredit must be a positive number',
      'dashboardActions.1.id: id should not be empty',
    ]);
  });

  it('should throw Error if validation cause of empty Element in FifoQueue', () => {
    expect(() =>
      validationService.validateInitialeFifoValues(
        [
          { id: 'A', maxCredit: 20, credit: 20 },
          { id: 'B', maxCredit: 20, credit: 20 },
          { id: 'C', maxCredit: 30, credit: 30 },
        ],
        [''],
      ),
    ).toThrow(Error);
  });

  it('should throw Error if validation caause of action credit is negatif', () => {
    expect(() =>
      validationService.validateInitialeFifoValues(
        [
          { id: 'A', maxCredit: 20, credit: -20 },
          { id: 'B', maxCredit: 20, credit: 20 },
          { id: 'C', maxCredit: 30, credit: 30 },
        ],
        ['A'],
      ),
    ).toThrow(Error);
  });

  it('should throw Error if validation caause of action maxCredit is negatif', () => {
    expect(() =>
      validationService.validateInitialeFifoValues(
        [
          { id: 'A', maxCredit: -20, credit: 20 },
          { id: 'B', maxCredit: 20, credit: 20 },
          { id: 'C', maxCredit: 30, credit: 30 },
        ],
        ['A'],
      ),
    ).toThrow(Error);
  });

  it('should throw Error if validation caause of id is empty', () => {
    expect(() =>
      validationService.validateInitialeFifoValues(
        [
          { id: '', maxCredit: -20, credit: 20 },
          { id: 'B', maxCredit: 20, credit: 20 },
          { id: 'C', maxCredit: 30, credit: 30 },
        ],
        ['A'],
      ),
    ).toThrow(Error);
  });

  it('should return true if initiale values validation passes', () => {
    const actionsInit = initialeActions; // Données initiales satisfaisant les contraintes de validation
    const fifoQueueInit = initialeFifoElements; // Données initiales satisfaisant les contraintes de validation

    const result = validationService.validateInitialeFifoValues(
      actionsInit,
      fifoQueueInit,
    );

    expect(result).toBe(true);
  });
});
