import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { InviteUserDialog } from "@/components/superagent/users/InviteUserDialog";
import { UsersTableClient } from "@/components/superagent/users/UsersTableClient";
import { normalizeClerkInvite, normalizeClerkUser } from "@/lib/utils/clerk";
import { clerkClient } from "@clerk/nextjs/server";

export default async function UsersPage() {
  const client = await clerkClient();

  // Fetch in parallel for better performance
  const [userList, invitationList] = await Promise.all([
    client.users.getUserList({ limit: 100 }),
    client.invitations.getInvitationList({ status: "pending" }),
  ]);

  // Normalize using shared utilities (SRP)
  const users = userList.data.map(normalizeClerkUser);
  const invites = invitationList.data.map(normalizeClerkInvite);
  const allItems = [...users, ...invites];

  return (
    <AdminShell>
      <div className="w-full space-y-6">
        <PageHeader
          title="User Management"
          subtitle="Manage platform users, roles, and platform permissions."
          action={<InviteUserDialog />}
        />

        <UsersTableClient initialUsers={allItems} />
      </div>
    </AdminShell>
  );
}
