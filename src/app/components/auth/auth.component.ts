import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>('login');
  readonly isRegister = computed(() => this.mode() === 'register');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly roles = signal<Role[]>([]);
  readonly loadingRoles = signal(false);
  readonly roleLoadError = signal('');
  private readonly hasLoadedRoles = signal(false);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/devices']);
    }
  }

  authForm = this.formBuilder.group({
    name: [''],
    location: [''],
    roleId: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  switchMode(mode: AuthMode): void {
    if (this.mode() === mode) {
      return;
    }

    this.mode.set(mode);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (mode === 'register') {
      this.ensureRolesLoaded();
    }

    this.applyModeValidators();
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.applyModeValidators();
    this.authForm.updateValueAndValidity();

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    if (this.isRegister()) {
      const selectedRoleId = this.normalizeRoleId(this.authForm.controls.roleId.value);

      if (!selectedRoleId) {
        this.errorMessage.set('Please select a valid role.');
        this.authForm.controls.roleId.markAsTouched();
        this.loading.set(false);
        return;
      }

      const registerPayload = {
        name: this.authForm.controls.name.value?.trim() ?? '',
        location: this.authForm.controls.location.value?.trim() ?? '',
        roleId: selectedRoleId,
        email: this.authForm.controls.email.value?.trim() ?? '',
        password: this.authForm.controls.password.value ?? ''
      };

      this.authService.register(registerPayload).subscribe({
        next: (message) => {
          this.switchMode('login');
          this.successMessage.set(message || 'Cont creat cu succes.');
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'Înregistrarea a eșuat.'));
          this.loading.set(false);
        }
      });

      return;
    }

    const loginPayload = {
      email: this.authForm.controls.email.value?.trim() ?? '',
      password: this.authForm.controls.password.value ?? ''
    };

    this.authService.login(loginPayload).subscribe({
      next: (token) => {
        if (!token || token === 'undefined' || token === 'null') {
          this.errorMessage.set('Token invalid primit de la server.');
          this.authService.clearToken();
          this.loading.set(false);
          return;
        }

        this.authService.setToken(token);
        this.successMessage.set('Autentificare reușită.');
        this.loading.set(false);
        this.router.navigate(['/devices']);
      },
      error: (error) => {
        this.errorMessage.set(this.extractErrorMessage(error, 'Autentificarea a eșuat.'));
        this.loading.set(false);
      }
    });
  }

  retryLoadRoles(): void {
    this.loadRoles();
  }

  private ensureRolesLoaded(): void {
    if (this.hasLoadedRoles() || this.loadingRoles()) {
      return;
    }

    this.loadRoles();
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.roleLoadError.set('');

    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.hasLoadedRoles.set(true);
        this.loadingRoles.set(false);
      },
      error: (error) => {
        this.roles.set([]);
        this.roleLoadError.set(this.extractErrorMessage(error, 'Could not load roles.'));
        this.loadingRoles.set(false);
      }
    });
  }

  private applyModeValidators(): void {
    const nameControl = this.authForm.controls.name;
    const locationControl = this.authForm.controls.location;
    const roleIdControl = this.authForm.controls.roleId;

    if (this.isRegister()) {
      nameControl.setValidators([Validators.required, Validators.minLength(2)]);
      locationControl.setValidators([Validators.required, Validators.minLength(2)]);
      roleIdControl.setValidators([Validators.required]);
    } else {
      nameControl.clearValidators();
      locationControl.clearValidators();
      roleIdControl.clearValidators();
    }

    nameControl.updateValueAndValidity({ emitEvent: false });
    locationControl.updateValueAndValidity({ emitEvent: false });
    roleIdControl.updateValueAndValidity({ emitEvent: false });
  }

  private normalizeRoleId(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim();

    if (!normalizedValue || normalizedValue === 'undefined' || normalizedValue === 'null') {
      return null;
    }

    return normalizedValue;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const errorWrapper = error as { error?: unknown };

      if (typeof errorWrapper.error === 'string') {
        return errorWrapper.error;
      }

      if (
        typeof errorWrapper.error === 'object' &&
        errorWrapper.error !== null &&
        'message' in errorWrapper.error &&
        typeof (errorWrapper.error as { message?: unknown }).message === 'string'
      ) {
        return (errorWrapper.error as { message: string }).message;
      }
    }

    return fallback;
  }
}
