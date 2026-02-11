"use client";

import { DocumentEditor } from "./DocumentEditor";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

/**
 * ContractTabContent - Tab content for the contract view
 *
 * This component replaces the previous DocumentPreviewEditable
 * with the new integrated PDF/Form editor
 */
export function ContractTabContent() {
  const params = useParams();
  const dealId = params?.id as string;

  return (
    <div className="space-y-6">
      {/* Page Navigator - Can be enhanced later with actual page navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
        <span className="text-[#111827]">Contract Document</span>
        <ChevronRight className="w-3 h-3" />
        <span>Edit & Review</span>
      </div>

      {/* Main Editor */}
      <DocumentEditor dealId={dealId} />
    </div>
  );
}
