"use server";

import { type UserRoleType } from "@/lib/constants/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
}

/**
 * Helper: Prepares the invitation payload for Clerk.
 * Uses UPPERCASE role from enum
 */
const getInvitePayload = (email: string, role: UserRoleType) => ({
  emailAddress: email.trim().toLowerCase(),
  publicMetadata: {
    role, // UPPERCASE from enum
    status: "ACTIVE",
  },
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
    : "http://localhost:3000/sign-up",
});

/**
 * Helper: Syncs the admin user view.
 */
const syncAdminView = () => revalidatePath("/admin/users");

export async function inviteUser(email: string, role: UserRoleType) {
  const client = await clerkClient();
  const formattedEmail = email.trim().toLowerCase();

  try {
    const existingUsers = await client.users.getUserList({
      emailAddress: [formattedEmail],
      limit: 1,
    });
    if (existingUsers.data.length > 0)
      return {
        success: false,
        error: "User is already registered and active.",
      };

    await client.invitations.createInvitation(
      getInvitePayload(formattedEmail, role)
    );
    syncAdminView();
    return { success: true };
  } catch (error: any) {
    if (error.errors?.some((e: any) => e.code === "duplicate_record")) {
      return await resendInvite(formattedEmail, role);
    }
    return {
      success: false,
      error: error.errors?.[0]?.message || "Failed to send invite",
    };
  }
}

/**
 * Helper: Handles resending an invite by revoking previous one.
 */
async function resendInvite(email: string, role: UserRoleType) {
  const client = await clerkClient();
  try {
    const invitations = await client.invitations.getInvitationList({
      status: "pending",
    });
    const pendingInvite = invitations.data.find(
      (inv) => inv.emailAddress === email
    );

    if (pendingInvite) {
      await client.invitations.revokeInvitation(pendingInvite.id);
      await client.invitations.createInvitation(getInvitePayload(email, role));
      syncAdminView();
      return {
        success: true,
        message: "Previous invite revoked and new one sent.",
      };
    }
    return { success: false, error: "Invite not found to resend." };
  } catch (err: any) {
    const errorMessage = err?.message || "Failed to resend invite.";
    return { success: false, error: errorMessage };
  }
}

export async function bulkInviteUser(
  users: { email: string; role: UserRoleType }[]
) {
  const promises = users.map((user) => inviteUser(user.email, user.role));
  const rawResults = await Promise.all(promises);

  const results = users.map((u, i) => ({
    email: u.email,
    success: rawResults[i].success,
    error: "error" in rawResults[i] ? rawResults[i].error : undefined,
  }));
  const successCount = results.filter((r) => r.success).length;

  syncAdminView();
  return { successCount, failureCount: users.length - successCount, results };
}

export async function updateUserRole(userId: string, role: UserRoleType) {
  const client = await clerkClient();
  try {
    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
    syncAdminView();
    return { success: true, message: `User role updated to ${role}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update role" };
  }
}

export async function toggleUserStatus(userId: string, isBanned: boolean) {
  const client = await clerkClient();
  try {
    if (isBanned) {
      await client.users.unbanUser(userId);
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { status: "ACTIVE" },
      });
    } else {
      await client.users.banUser(userId);
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { status: "DEACTIVATED" },
      });
    }
    syncAdminView();
    return {
      success: true,
      message: `User ${isBanned ? "activated" : "deactivated"} successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update status",
    };
  }
}

export async function deleteUser(userId: string) {
  const client = await clerkClient();
  try {
    await client.users.deleteUser(userId);
    syncAdminView();
    return { success: true, message: "User deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

/**
 * Revoke a pending invitation. Use when user.type === "invite".
 * For actual users, use deleteUser instead.
 */
export async function revokeInvitation(invitationId: string) {
  const client = await clerkClient();
  try {
    await client.invitations.revokeInvitation(invitationId);
    syncAdminView();
    return { success: true, message: "Invitation revoked" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to revoke invitation",
    };
  }
}

/**
 * DEV/TEST ONLY: Create user directly in Clerk without invitation
 * This bypasses the invitation flow for testing auth, redirects, callbacks, etc.
 *
 * ⚠️ Should ONLY be used in non-production environments
 */
export async function createUserDirectly(email: string, role: UserRoleType) {
  const client = await clerkClient();
  const formattedEmail = email.trim().toLowerCase();

  try {
    // Check if user already exists
    const existingUsers = await client.users.getUserList({
      emailAddress: [formattedEmail],
      limit: 1,
    });
    if (existingUsers.data.length > 0) {
      return { success: false, error: "User already exists" };
    }

    // Create user directly with verified email
    const user = await client.users.createUser({
      emailAddress: [formattedEmail],
      password: "Superpw123.!",
      publicMetadata: {
        role,
        status: "ACTIVE",
        onboarded: false,
      },
      skipPasswordChecks: true,
    });
    syncAdminView();
    return {
      success: true,
      userId: user.id,
      message:
        "User created successfully. They can sign in with OTP code 424242 in test mode.",
    };
  } catch (error: any) {
    console.error("❌ Direct user creation failed:", error);
    const errorMessage =
      error.errors?.[0]?.longMessage ||
      error.errors?.[0]?.message ||
      error.message ||
      "Failed to create user";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
