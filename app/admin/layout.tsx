import { isValidRole, UserRole } from "@/lib/constants/roles";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();

  // Basic check for admin (middleware should handle this better, but layout is a safety net)
  // Use enum for role comparison
  const role = (user?.publicMetadata?.role as string) || "";
  if (user && (!isValidRole(role) || role !== UserRole.ADMIN)) {
    redirect("/dashboard");
  }

  // Check if admin has role and status (admins don't need onboarding)
  const hasRole = !!(user?.publicMetadata?.role as string);
  const hasStatus = !!(user?.publicMetadata?.status as string);

  if (!hasRole || !hasStatus) {
    redirect("/callback");
  }

  return <>{children}</>;
}
