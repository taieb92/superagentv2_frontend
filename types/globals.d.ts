import { type UserRoleType } from "@/lib/constants/roles";

export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRoleType;
    };
    publicMetadata?: {
      role?: UserRoleType;
    };
  }
}
