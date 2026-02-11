import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "";
  const status = (user?.publicMetadata?.status as string) || "";
  const onboarded = !!(user?.publicMetadata?.onboarded as boolean);

  if (!role || !status) {
    console.warn(
      "[Dashboard Layout] Metadata missing, allowing access - client will handle"
    );
    // Don't redirect - let the page render and client-side will handle redirect if needed
  } else if (!onboarded) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
