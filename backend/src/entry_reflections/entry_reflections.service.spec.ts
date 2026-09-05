import { Test, TestingModule } from '@nestjs/testing';
import { EntryReflectionsService } from './entry_reflections.service';

describe('EntryReflectionsService', () => {
  let service: EntryReflectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntryReflectionsService],
    }).compile();

    service = module.get<EntryReflectionsService>(EntryReflectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
