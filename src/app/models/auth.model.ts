export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  Token?: string;
  token?: string;
}

export interface RegisterRequest {
  name: string;
  location: string;
  roleId: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}
