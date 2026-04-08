import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<AuthMode>('login');
  isRegister = computed(() => this.mode() === 'register');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

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
      const registerPayload = {
        name: this.authForm.controls.name.value?.trim() ?? '',
        location: this.authForm.controls.location.value?.trim() ?? '',
        roleId: this.authForm.controls.roleId.value?.trim() ?? '',
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
