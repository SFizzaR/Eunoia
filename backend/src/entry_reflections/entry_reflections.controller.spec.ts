import { Test, TestingModule } from '@nestjs/testing';
import { EntryReflectionsController } from './entry_reflections.controller';
import { EntryReflectionsService } from './entry_reflections.service';

describe('EntryReflectionsController', () => {
  let controller: EntryReflectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryReflectionsController],
      providers: [EntryReflectionsService],
    }).compile();

    controller = module.get<EntryReflectionsController>(EntryReflectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
