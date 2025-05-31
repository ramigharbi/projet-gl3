export interface User {
  userId: number;
  username: string;
  password: string;
}

export interface UserPayload {
  userId: number;
  username: string;
}

export interface AuthResult {
  access_token: string;
}
