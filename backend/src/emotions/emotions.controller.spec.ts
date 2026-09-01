import { Test, TestingModule } from '@nestjs/testing';
import { EmotionsController } from './emotions.controller';
import { EmotionsService } from './emotions.service';

describe('EmotionsController', () => {
  let controller: EmotionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmotionsController],
      providers: [EmotionsService],
    }).compile();

    controller = module.get<EmotionsController>(EmotionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
