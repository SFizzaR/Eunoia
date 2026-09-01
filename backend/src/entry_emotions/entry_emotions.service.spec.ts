import { Test, TestingModule } from '@nestjs/testing';
import { EntryEmotionsService } from './entry_emotions.service';

describe('EntryEmotionsService', () => {
  let service: EntryEmotionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntryEmotionsService],
    }).compile();

    service = module.get<EntryEmotionsService>(EntryEmotionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
