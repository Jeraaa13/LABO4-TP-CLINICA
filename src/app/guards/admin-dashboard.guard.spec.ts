import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { adminDashboardGuard } from './admin-dashboard.guard';

describe('adminDashboardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adminDashboardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
