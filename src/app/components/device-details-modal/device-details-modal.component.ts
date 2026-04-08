import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Device } from '../../models/device.model';

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
  readonly device = input.required<Device>();
  readonly close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
