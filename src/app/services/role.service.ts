import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5133/api/Roles';

  getRoles(): Observable<Role[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((response) => this.normalizeRolesResponse(response))
    );
  }

  private normalizeRolesResponse(response: unknown): Role[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map((item) => this.toRole(item))
      .filter((role): role is Role => role !== null);
  }

  private toRole(item: unknown): Role | null {
    if (typeof item !== 'object' || item === null) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const id = this.pickString(record, ['id', 'roleId', 'roleID']);
    const name = this.pickString(record, ['name', 'roleName', 'role']);

    if (!id || !name) {
      return null;
    }

    return { id, name };
  }

  private pickString(record: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
      const value = record[key];

      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (trimmedValue && trimmedValue !== 'undefined' && trimmedValue !== 'null') {
          return trimmedValue;
        }
      }
    }

    return null;
  }
}
