import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Device, DeviceCreate } from '../../models/device.model';

@Component({
  selector: 'app-device-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './device-form-modal.component.html',
  styleUrl: './device-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onCancel()'
  }
})
export class DeviceFormModalComponent {
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialDevice = input<Device | null>(null);
  readonly existingDevices = input<Device[]>([]);

  readonly save = output<DeviceCreate>();
  readonly cancel = output<void>();

  readonly submitLabel = computed(() => (this.mode() === 'create' ? 'Create Device' : 'Save Changes'));
  readonly title = computed(() => (this.mode() === 'create' ? 'Create Device' : 'Edit Device'));
  readonly duplicateError = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, this.nonBlankValidator]),
    manufacturer: new FormControl('', [Validators.required, this.nonBlankValidator]),
    type: new FormControl('', [Validators.required, this.nonBlankValidator]),
    os: new FormControl('', [Validators.required, this.nonBlankValidator]),
    osVersion: new FormControl('', [Validators.required, this.nonBlankValidator]),
    processor: new FormControl('', [Validators.required, this.nonBlankValidator]),
    ram: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    description: new FormControl('', [Validators.required, this.nonBlankValidator])
  });

  ngOnInit(): void {
    this.patchFormFromInput();
  }

  ngOnChanges(): void {
    this.patchFormFromInput();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.duplicateError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: DeviceCreate = {
      name: value.name!.trim(),
      manufacturer: value.manufacturer!.trim(),
      type: value.type!.trim(),
      os: value.os!.trim(),
      osVersion: value.osVersion!.trim(),
      processor: value.processor!.trim(),
      ram: value.ram,
      description: value.description!.trim()
    };

    if (this.mode() === 'create' && this.deviceAlreadyExists(payload)) {
      this.duplicateError.set('A device with the same name, manufacturer, and type already exists.');
      return;
    }

    this.save.emit(payload);
  }

  private patchFormFromInput(): void {
    const device = this.initialDevice();

    if (device) {
      this.form.setValue({
        name: device.name,
        manufacturer: device.manufacturer,
        type: device.type,
        os: device.os,
        osVersion: device.osVersion,
        processor: device.processor,
        ram: device.ram,
        description: device.description
      });
      return;
    }

    this.form.reset({
      name: '',
      manufacturer: '',
      type: '',
      os: '',
      osVersion: '',
      processor: '',
      ram: null,
      description: ''
    });
  }

  private nonBlankValidator(control: AbstractControl): { blank: true } | null {
    const value = control.value;
    if (typeof value !== 'string') {
      return null;
    }

    return value.trim().length === 0 ? { blank: true } : null;
  }

  private deviceAlreadyExists(candidate: DeviceCreate): boolean {
    const normalizedName = candidate.name?.toLowerCase().trim();
    const normalizedManufacturer = candidate.manufacturer?.toLowerCase().trim();
    const normalizedType = candidate.type?.toLowerCase().trim();

    return this.existingDevices().some((device) => {
      return (
        device.name.toLowerCase().trim() === normalizedName &&
        device.manufacturer.toLowerCase().trim() === normalizedManufacturer &&
        device.type.toLowerCase().trim() === normalizedType
      );
    });
  }
}
