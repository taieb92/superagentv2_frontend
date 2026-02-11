import { DashboardStats } from "@/components/superagent/dashboard/DashboardStats";
import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { QuickNav } from "@/components/superagent/ui/QuickNav";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { DealDetailDto } from "@/lib/api/generated/fetch-client";
import { getServerClient } from "@/lib/api/server-client";

export default async function AdminDashboardPage() {
  const user = await currentUser();
  const client = await clerkClient();

  // Fetch data from Clerk
  const fullUserList = await client.users.getUserList({
    limit: 10,
    orderBy: "-created_at",
  });
  const invitationList = await client.invitations.getInvitationList({
    status: "pending",
  });

  // Fetch data from Backend using generated client
  const apiClient = await getServerClient();

  let deals: DealDetailDto[] = [];
  try {
    const dealsResponse = await apiClient.listDeals(
      undefined, // status
      undefined, // search
      undefined, // limit
      undefined, // offset
      undefined // docType
    );
    deals = dealsResponse.items || [];
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    deals = [];
  }

  const totalUsers = fullUserList.totalCount || 0;
  const recentUsers = fullUserList.data
    .map((u) => ({
      name:
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.emailAddresses[0]?.emailAddress ||
        "User",
      email: u.emailAddresses[0]?.emailAddress || "",
      image: u.imageUrl,
      initial:
        u.firstName?.[0] ||
        u.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
        "U",
      createdAt: new Date(u.createdAt).toLocaleDateString(),
    }))
    .slice(0, 5);

  const pendingInvites =
    invitationList.totalCount || invitationList.data.length || 0;

  // Calculate real contract stats
  const activeContracts = deals.length;
  const completedContracts = deals.filter((d) => d.status === "CLOSED").length;
  const avgCompletion =
    activeContracts > 0
      ? Math.round((completedContracts / activeContracts) * 100)
      : 0;

  return (
    <AdminShell>
      <div className="max-w-[1280px] mx-auto space-y-10">
        <PageHeader
          title="Admin Dashboard"
          subtitle={`Welcome back, ${user?.firstName || "Admin"}. Overview of system status and performance.`}
        />

        <section className="space-y-6">
          <DashboardStats
            userCount={totalUsers}
            inviteCount={pendingInvites}
            contractCount={activeContracts}
            avgCompletion={avgCompletion}
          />
        </section>

        <section>
          <QuickNav />
        </section>
      </div>
    </AdminShell>
  );
}
