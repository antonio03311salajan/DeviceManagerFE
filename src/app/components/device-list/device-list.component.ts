import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../models/device.model';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule],
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
  private readonly deviceService = inject(DeviceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly devices = signal<Device[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly totalDevices = computed(() => this.devices().length);

  constructor() {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.deviceService
      .getDevices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.devices.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not load devices. Please try again.');
          this.loading.set(false);
        }
      });
  }

  addNewDevice(): void {
    
  }

  removeDevice(id: string): void {
    if (!window.confirm('Delete this device?')) {
      return;
    }

    this.deviceService
      .deleteDevice(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.devices.update((currentDevices) =>
            currentDevices.filter((device) => device.deviceId !== id)
          );
        },
        error: () => {
          this.errorMessage.set('Could not delete the selected device.');
        }
      });
  }
}
