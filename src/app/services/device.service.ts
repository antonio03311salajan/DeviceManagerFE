import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device, DeviceCreate } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5133/api/Devices';

  getDevices(): Observable<Device[]> {
    return this.http
      .get<Device[]>(this.apiUrl)
  }

  createDevice(device: DeviceCreate): Observable<Device> {
    return this.http
      .post<Device>(this.apiUrl, device);
  }

  deleteDevice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
