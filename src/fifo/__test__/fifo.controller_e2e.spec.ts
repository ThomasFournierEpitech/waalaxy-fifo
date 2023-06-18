import { Test, TestingModule } from '@nestjs/testing';
import { FifoController } from '../fifo.controller';
import { FifoService } from '../fifo.service';
import { FifoElementDto } from '../dtos/fifo.dto';
import { FifoRepository } from '../fifo.repository.service';
import { FifoGateway } from '../fifo.gateway';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FifoValidationService } from '../fifo-validation/fifo-validation.service';

describe('FifoController e2e validation', () => {
  let app: INestApplication;
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
    fifoService = module.get<FifoService>(FifoService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });

  it('should throw error on element null', async () => {
    //Arrange
    const body: FifoElementDto = { fifoElement: null };
    const expectedQueue = ['A', 'B', 'C'];
    jest
      .spyOn(fifoService, 'addFifoQueueElement')
      .mockReturnValue(expectedQueue);

    const response = await request(app.getHttpServer())
      .post('/fifo/fifoElement')
      .send(body)
      .expect(400);
    expect(response.statusCode).toBe(400);
  });

  it('should throw error on element empty', async () => {
    //Arrange
    const body: FifoElementDto = { fifoElement: '' };
    const expectedQueue = ['A', 'B', 'C'];
    jest
      .spyOn(fifoService, 'addFifoQueueElement')
      .mockReturnValue(expectedQueue);

    const response = await request(app.getHttpServer())
      .post('/fifo/fifoElement')
      .send(body)
      .expect(400);
    expect(response.statusCode).toBe(400);
  });
});
