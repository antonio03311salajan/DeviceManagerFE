import { Routes } from '@angular/router';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'devices', component: DeviceListComponent, canActivate: [authGuard] },
  { path: 'users', component: UserListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' }
];