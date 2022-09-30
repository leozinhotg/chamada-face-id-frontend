/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FaceIdService } from './face-id.service';

describe('Service: FaceId', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FaceIdService]
    });
  });

  it('should ...', inject([FaceIdService], (service: FaceIdService) => {
    expect(service).toBeTruthy();
  }));
});
