import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showLogoutButton(): boolean {
    return this.authService.isAuthenticated() && !this.router.url.startsWith('/auth');
  }

  logout(): void {
    this.authService.clearToken();
    this.router.navigate(['/auth']);
  }
}
