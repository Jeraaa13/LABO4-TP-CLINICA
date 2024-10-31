import { CanActivateFn } from '@angular/router';

export const adminDashboardGuard: CanActivateFn = (route, state) => {
  return true;
};
