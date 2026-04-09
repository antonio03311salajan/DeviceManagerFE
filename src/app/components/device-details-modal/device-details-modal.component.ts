import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Device, DeviceDescriptionRequest } from '../../models/device.model';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-device-details-modal',
  templateUrl: './device-details-modal.component.html',
  styleUrl: './device-details-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onClose()'
  }
})
export class DeviceDetailsModalComponent {
  private readonly deviceService = inject(DeviceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly device = input.required<Device>();
  readonly close = output<void>();
  readonly edit = output<Device>();
  readonly isGenerating = signal(false);
  readonly generatedDescription = signal<string>('');
  readonly generateError = signal<string>('');
  readonly descriptionToDisplay = computed(() => this.generatedDescription() || this.device().description);

  onClose(): void {
    this.close.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  onEdit(): void {
    this.edit.emit(this.device());
  }

  onGenerateDescription(): void {
    if (this.isGenerating()) {
      return;
    }

    this.generateError.set('');
    this.isGenerating.set(true);

    this.deviceService
      .generateDescription(this.toDescriptionRequest(this.device()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (description) => {
          this.generatedDescription.set(description.trim());
          this.isGenerating.set(false);
        },
        error: () => {
          this.generateError.set('Could not generate a description right now. Please try again.');
          this.isGenerating.set(false);
        }
      });
  }

  private toDescriptionRequest(device: Device): DeviceDescriptionRequest {
    return {
      name: device.name,
      manufacturer: device.manufacturer,
      type: device.type,
      os: device.os,
      osVersion: device.osVersion,
      processor: device.processor,
      ram: device.ram ?? 0
    };
  }
}
