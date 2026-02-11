"use client";

import { DocumentEditor } from "@/components/superagent/contracts/DocumentEditor";

export function ContractTabContent() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <DocumentEditor />
    </div>
  );
}
