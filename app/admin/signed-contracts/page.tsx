import { SignedContractsTable } from "@/components/superagent/contracts/SignedContractsTable";
import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { SectionHeader } from "@/components/superagent/shell/SectionHeader";
import { DocumentDetailDto } from "@/lib/api/generated/fetch-client";
import { getServerClient } from "@/lib/api/server-client";

async function getSignedDocuments() {
  const client = await getServerClient();
  return client.getSignedDocuments();
}

export default async function SignedContractsPage() {
  let documents: DocumentDetailDto[] = [];
  let error = null;

  try {
    documents = await getSignedDocuments();
    console.log(
      `[SignedContractsPage] Fetched ${documents.length} documents from API`
    );
  } catch (e: any) {
    error = e.message;
    console.error(`[SignedContractsPage] Fetch error: ${e.message}`);
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <SectionHeader
          title="Signed Contracts"
          meta="Review and download all legally executed contracts across the platform."
        />

        {error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
            Error: {error}
          </div>
        ) : (
          <SignedContractsTable documents={documents} />
        )}
      </div>
    </AdminShell>
  );
}
