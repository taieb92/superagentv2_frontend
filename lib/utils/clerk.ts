import {
  getDefaultRole,
  isValidRole,
  UserRole,
  type UserRoleType,
} from "@/lib/constants/roles";
import { Invitation, User } from "@clerk/nextjs/server";

export type platformRole = UserRoleType;
export type platformStatus =
  | "active"
  | "banned"
  | "invited"
  | "deactivated"
  | "uninvited";

export interface NormalizedUser {
  id: string;
  type: "user" | "invite";
  email: string;
  name: string;
  image: string;
  role: platformRole;
  status: platformStatus;
  joinedAt: string;
}

/**
 * Normalizes a Clerk User object into a standard platform user structure.
 */
export function normalizeClerkUser(user: User): NormalizedUser {
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "unknown@user.com";

  const role = (
    isValidRole(user.publicMetadata.role as string)
      ? (user.publicMetadata.role as UserRoleType)
      : getDefaultRole()
  ) as platformRole;
  const statusMetadata = user.publicMetadata.status as string;

  // Determine status
  let status: platformStatus = "active";

  if (user.banned) {
    status = "banned";
  } else if (statusMetadata === "DEACTIVATED") {
    status = "deactivated";
  } else if (statusMetadata === "ACTIVE") {
    status = "active";
  } else if (role === UserRole.ADMIN) {
    // Admins are active by default unless banned/deactivated
    status = "active";
  } else {
    // No ACTIVE metadata and not an admin -> Uninvited social login
    status = "uninvited";
  }

  return {
    id: user.id,
    type: "user",
    email: primaryEmail,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
    image: user.imageUrl,
    role: role,
    status: status,
    joinedAt: new Date(user.createdAt).toISOString(),
  };
}

/**
 * Normalizes a Clerk Invitation object into a standard platform structure.
 */
export function normalizeClerkInvite(invite: Invitation): NormalizedUser {
  return {
    id: invite.id,
    type: "invite",
    email: invite.emailAddress,
    name: "Pending Invite",
    image: "",
    role: (invite.publicMetadata &&
    isValidRole(invite.publicMetadata.role as string)
      ? (invite.publicMetadata.role as UserRoleType)
      : getDefaultRole()) as platformRole,
    status: "invited",
    joinedAt: new Date(invite.createdAt).toISOString(),
  };
}
