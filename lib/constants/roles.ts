/**
 * User roles - single source of truth
 * Must match backend UserRole enum values
 */
export const UserRole = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Helper to check if a string is a valid role
 */
export function isValidRole(
  role: string | null | undefined
): role is UserRoleType {
  return role === UserRole.ADMIN || role === UserRole.AGENT;
}

/**
 * Get default role for new users
 */
export function getDefaultRole(): UserRoleType {
  return UserRole.AGENT;
}
