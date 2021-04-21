import { TestBed } from '@angular/core/testing';

import { DisplayStateService } from './display-state.service';

describe('DisplayStateService', () => {
  let service: DisplayStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
