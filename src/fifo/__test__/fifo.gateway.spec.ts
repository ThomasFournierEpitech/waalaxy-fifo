import { Test, TestingModule } from '@nestjs/testing';
import { FifoGateway } from '../fifo.gateway';

describe('FifoGateway', () => {
  let gateway: FifoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FifoGateway],
    }).compile();

    gateway = module.get<FifoGateway>(FifoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
