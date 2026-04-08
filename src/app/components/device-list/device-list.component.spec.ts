import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DeviceListComponent } from './device-list.component';
import { DeviceService } from '../../services/device.service';

describe('DeviceListComponent', () => {
  let component: DeviceListComponent;
  let fixture: ComponentFixture<DeviceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceListComponent],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            getDevices: () => of([]),
            deleteDevice: () => of(void 0)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
