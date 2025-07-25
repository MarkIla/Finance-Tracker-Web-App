// src/auth/types/user-payload.type.ts
import { JwtPayload } from './jwt-payload.type';

/** what CurrentUser() returns */
export interface UserPayload extends JwtPayload {
  email: string;
}
