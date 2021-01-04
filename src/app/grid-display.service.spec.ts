import { TestBed } from '@angular/core/testing';

import { GridDisplayService } from './grid-display.service';

describe('GridDisplayService', () => {
  let service: GridDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
