import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { Device, DeviceCreate } from '../../models/device.model';
import { DeviceDetailsModalComponent } from '../device-details-modal/device-details-modal.component';
import { DeviceFormModalComponent } from '../device-form-modal/device-form-modal.component';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule, DeviceDetailsModalComponent, DeviceFormModalComponent],
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
  readonly selectedDevice = signal<Device | null>(null);
  readonly formMode = signal<'create' | 'edit' | null>(null);
  readonly editingDevice = signal<Device | null>(null);
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
    this.selectedDevice.set(null);
    this.editingDevice.set(null);
    this.formMode.set('create');
  }

  openDetails(device: Device): void {
    this.selectedDevice.set(device);
  }

  closeDetails(): void {
    this.selectedDevice.set(null);
  }

  openEditForm(device: Device): void {
    this.closeDetails();
    this.editingDevice.set(device);
    this.formMode.set('edit');
  }

  closeDeviceForm(): void {
    this.formMode.set(null);
    this.editingDevice.set(null);
  }

  saveDevice(payload: DeviceCreate): void {
    if (this.formMode() === 'edit' && this.editingDevice()) {
      const id = this.editingDevice()!.deviceId;

      this.deviceService
        .updateDevice(id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.closeDeviceForm();
            this.loadDevices();
          },
          error: () => {
            this.errorMessage.set('Could not update the selected device.');
          }
        });
      return;
    }

    this.deviceService
      .createDevice(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeDeviceForm();
          this.loadDevices();
        },
        error: () => {
          this.errorMessage.set('Could not create the device.');
        }
      });
  }

  removeDevice(id: string, event?: Event): void {
    event?.stopPropagation();

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

          if (this.selectedDevice()?.deviceId === id) {
            this.closeDetails();
          }
        },
        error: () => {
          this.errorMessage.set('Could not delete the selected device.');
        }
      });
  }
}
