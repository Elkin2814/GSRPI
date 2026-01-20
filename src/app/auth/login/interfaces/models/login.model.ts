import { User } from '../../../interfaces/models/user.model';

export interface Login {
  username: string;
  email?: string;
  password: string;
  loginType: string;
  token: string;
}

export interface UserLoginResponse {
  user: User; // tu modelo de usuario con roles
  token: string; // token JWT
}
