import { Test, TestingModule } from '@nestjs/testing';
import { EntryEmotionsController } from './entry_emotions.controller';
import { EntryEmotionsService } from './entry_emotions.service';

describe('EntryEmotionsController', () => {
  let controller: EntryEmotionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryEmotionsController],
      providers: [EntryEmotionsService],
    }).compile();

    controller = module.get<EntryEmotionsController>(EntryEmotionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
