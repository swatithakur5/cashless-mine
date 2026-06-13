import { TestBed } from '@angular/core/testing';

import { IntimationService } from './intimation.service';

describe('IntimationService', () => {
  let service: IntimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
