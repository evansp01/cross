import { TestBed } from '@angular/core/testing';

import { PuzzleStateService } from './puzzle-state.service';

describe('PuzzleStateService', () => {
  let service: PuzzleStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuzzleStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
