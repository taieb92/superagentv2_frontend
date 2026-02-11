"use server";

import type { IOnboardingRequestDTO } from "@/lib/api/generated/fetch-client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: IOnboardingRequestDTO) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...data,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}

export async function getCurrentProfile() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Not authenticated", data: null };
  }

  const client = await clerkClient();

  try {
    const user = await client.users.getUser(userId);
    return {
      success: true,
      data: user.publicMetadata as IOnboardingRequestDTO,
    };
  } catch (error: any) {
    console.error("Get profile error:", error);
    return {
      success: false,
      error: error.message || "Failed to get profile",
      data: null,
    };
  }
}
