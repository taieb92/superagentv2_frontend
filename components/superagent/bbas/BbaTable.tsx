"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface BbaTableProps {
  bbas: any[];
  loading: boolean;
}

export function BbaTable({ bbas, loading }: BbaTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-white border border-zinc-200 overflow-hidden">
        <div className="h-12 border-b border-zinc-200 bg-zinc-50/50" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-zinc-100 flex items-center px-6 gap-4"
          >
            <div className="h-4 w-32 bg-zinc-100 animate-pulse" />
            <div className="h-4 w-24 bg-zinc-100 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (bbas.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-50 border border-dashed border-zinc-200">
        <div className="w-12 h-12 bg-white flex items-center justify-center mx-auto mb-4 border border-zinc-200 shadow-sm">
          <FileText className="w-6 h-6 text-zinc-300" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">
          No agreements found
        </h3>
        <p className="text-zinc-500 mt-1 max-w-sm mx-auto">
          Get started by creating a new buyer broker agreement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500">
            <th className="font-medium py-3 px-6 w-[40%]">Buyer Name</th>
            <th className="font-medium py-3 px-6 w-[20%]">Status</th>
            <th className="font-medium py-3 px-6 w-[25%]">Last Updated</th>
            <th className="font-medium py-3 px-6 text-right w-[15%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {bbas.map((bba) => (
            <tr
              key={bba.id}
              className="group hover:bg-zinc-50 transition-colors"
            >
              <td className="py-4 px-6">
                <Link href={`/dashboard/bbas/${bba.id}`} className="block">
                  <div className="font-semibold text-zinc-900 group-hover:text-[#0F766E] transition-colors">
                    {bba.buyerName || "Unknown Buyer"}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {bba.mlsId ? `MLS: ${bba.mlsId}` : "No Property Linked"}
                  </div>
                </Link>
              </td>
              <td className="py-4 px-6">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border",
                    bba.status?.toLowerCase() === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-zinc-100 text-zinc-600 border-zinc-200"
                  )}
                >
                  {bba.status || "DRAFT"}
                </span>
              </td>
              <td className="py-4 px-6 text-zinc-500">
                {bba.updatedAt
                  ? formatDistanceToNow(new Date(bba.updatedAt), {
                      addSuffix: true,
                    })
                  : "-"}
              </td>
              <td className="py-4 px-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 group-hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bbas/${bba.id}`}>
                        Open Agreement
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Send to Buyer</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
