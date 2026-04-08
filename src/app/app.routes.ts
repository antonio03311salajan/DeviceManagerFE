import { Routes } from '@angular/router';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { UserListComponent } from './components/user-list/user-list.component';

export const routes: Routes = [
  { path: '', component: DeviceListComponent },
  { path: 'devices', component: DeviceListComponent },
  { path: 'users', component: UserListComponent },
  { path: '**', redirectTo: '' }
];