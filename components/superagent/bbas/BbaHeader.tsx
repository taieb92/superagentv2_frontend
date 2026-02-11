"use client";

import { StatusPill } from "@/components/superagent/ui/StatusPill";
import { Button } from "@/components/ui/button";
import { Download, Mail, MoreHorizontal } from "lucide-react";

interface BbaHeaderProps {
  buyerName: string;
  status: string;
  lastSaved?: string;
  missingFieldsCount?: number;
  onDownload: () => void;
}

export function BbaHeader({
  buyerName,
  status,
  lastSaved,
  missingFieldsCount = 0,
  onDownload,
}: Readonly<BbaHeaderProps>) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1
            className="text-xl font-semibold text-zinc-900 tracking-tight truncate max-w-[400px]"
            title={buyerName}
          >
            {buyerName}
          </h1>
          <StatusPill status={status} />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-600">
            Buyer Broker Agreement
          </span>
          {lastSaved && (
            <>
              <span className="w-1 h-1 bg-zinc-300" />
              <span>Synced {lastSaved}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {missingFieldsCount > 0 && (
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-medium text-amber-600">
              {missingFieldsCount} Required Fields Missing
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="h-9 hidden sm:flex"
        >
          <Download className="w-3.5 h-3.5 mr-2" /> Download
        </Button>
        <Button variant="outline" size="sm" className="h-9 hidden sm:flex">
          <Mail className="w-3.5 h-3.5 mr-2" /> Review
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
