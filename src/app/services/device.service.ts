import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Device, DeviceCreate, DeviceDescriptionRequest } from '../models/device.model';

type GeneratedDescriptionResponse = {
  generatedDescription: string;
};

type ActionMessageResponse = {
  message: string;
};

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

  searchDevices(query: string): Observable<Device[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return this.getDevices();
    }

    return this.http.get<Device[]>(`${this.apiUrl}/search`, {
      params: { q: trimmedQuery }
    });
  }

  createDevice(device: DeviceCreate): Observable<Device> {
    return this.http
      .post<Device>(this.apiUrl, device);
  }

  updateDevice(id: string, device: DeviceCreate): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/${id}`, device);
  }

  generateDescription(payload: DeviceDescriptionRequest): Observable<string> {
    return this.http
      .post<GeneratedDescriptionResponse>(`${this.apiUrl}/generate-description`, payload)
      .pipe(map((response) => this.extractGeneratedDescription(response)));
  }

  deleteDevice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignDevice(deviceId: string): Observable<string> {
    return this.http
      .post<ActionMessageResponse>(`${this.apiUrl}/${deviceId}/assign`, null)
      .pipe(map((response) => response.message));
  }

  unassignDevice(deviceId: string): Observable<string> {
    return this.http
      .post<ActionMessageResponse>(`${this.apiUrl}/${deviceId}/unassign`, null)
      .pipe(map((response) => response.message));
  }

  private extractGeneratedDescription(response: GeneratedDescriptionResponse): string {
    return response.generatedDescription.trim();
  }
}
