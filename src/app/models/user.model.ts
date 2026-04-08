export interface User {
  userId: string;
  name: string;
  role: string;
  location: string;
}

export interface UserCreate {
  name: string;
  roleId: string;
  location: string;
}