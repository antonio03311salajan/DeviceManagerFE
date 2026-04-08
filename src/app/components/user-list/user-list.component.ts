import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users: User[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Eroare la încărcarea utilizatorilor:', err);
        this.loading = false;
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Sigur vrei să ștergi acest utilizator?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.userId !== id);
      });
    }
  }
}