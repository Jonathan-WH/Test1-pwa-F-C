import { TestBed } from '@angular/core/testing';

import { IdeaService } from './idea.service';

describe('IdeaserviceService', () => {
  let service: IdeaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdeaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
