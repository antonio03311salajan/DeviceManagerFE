import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User, UserCreate } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  users: User[] = [];
  roles: Role[] = [];
  loading = true;
  loadingRoles = true;
  roleError = '';
  createError = '';
  isSubmitting = false;
  showCreateForm = false;
  newUserName = '';
  newUserRoleId = '';
  newUserLocation = '';

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleError = '';

    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loadingRoles = false;
      },
      error: (err) => {
        console.error('Eroare la încărcarea rolurilor:', err);
        this.roleError = 'Could not load roles.';
        this.loadingRoles = false;
      }
    });
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

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createError = '';

    if (!this.showCreateForm) {
      this.resetCreateForm();
    }
  }

  createUser(): void {
    this.createError = '';
    const name = this.newUserName.trim();
    const roleId = this.newUserRoleId.trim();
    const location = this.newUserLocation.trim();

    if (!name || !roleId || !location) {
      this.createError = 'Please fill in name, role and location.';
      return;
    }

    const payload: UserCreate = {
      name,
      roleId,
      location
    };

    this.isSubmitting = true;
    this.userService.createUser(payload).subscribe({
      next: (createdUser) => {
        this.users = [createdUser, ...this.users];
        this.isSubmitting = false;
        this.showCreateForm = false;
        this.resetCreateForm();
      },
      error: (err) => {
        console.error('Eroare la crearea utilizatorului:', err);
        this.createError = 'Could not create user.';
        this.isSubmitting = false;
      }
    });
  }

  private resetCreateForm(): void {
    this.newUserName = '';
    this.newUserRoleId = '';
    this.newUserLocation = '';
  }
}