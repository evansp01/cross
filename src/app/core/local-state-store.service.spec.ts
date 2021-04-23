import { TestBed } from '@angular/core/testing';

import { LocalStateStoreService } from './local-state-store.service';

describe('LocalStateStoreService', () => {
  let service: LocalStateStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStateStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
