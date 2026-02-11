"use client";

import { EmptyState } from "@/components/superagent/ui/EmptyState";
import { StatusPill } from "@/components/superagent/ui/StatusPill";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, FileText } from "lucide-react";

// Mock interface for now
interface Contract {
  id: string;
  address: string;
  mlsId?: string;
  buyerName: string;
  status: string;
  completionStatus: string; // e.g., "Ready" or "Missing 2 fields"
  lastUpdated: string;
}

interface ContractsTableProps {
  data: Contract[];
}

export function ContractsTable({ data }: Readonly<ContractsTableProps>) {
  if (data.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={<FileText className="h-5 w-5 text-zinc-400" />}
          title="No contracts found"
          description="Your recent contracts and purchase agreements will appear here."
          primaryActionLabel=""
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-zinc-200 bg-white shadow-sm mt-4">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500">
          <tr>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">
              Document
            </th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">
              Buyer
            </th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">
              Status
            </th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">
              Completion
            </th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">
              Updated
            </th>
            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((contract) => (
            <tr
              key={contract.id}
              className="group hover:bg-zinc-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">
                      {contract.address}
                    </div>
                    {contract.mlsId && (
                      <div className="text-xs text-zinc-500">
                        MLS: {contract.mlsId}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-zinc-600 font-medium">
                {contract.buyerName || "—"}
              </td>
              <td className="px-6 py-4">
                <StatusPill status={contract.status} />
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600">
                  {contract.completionStatus}
                </span>
              </td>
              <td className="px-6 py-4 text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {contract.lastUpdated}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Open <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
