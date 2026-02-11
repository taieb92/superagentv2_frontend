"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import * as Types from "@/lib/api/generated/fetch-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/superagent/ui/EmptyState";

interface GuestsTabContentProps {
  guests: Types.GuestLinkDto[];
  isLoading: boolean;
  onInviteClick: () => void;
  onRevoke: (id: string) => void;
}

export function GuestsTabContent({
  guests,
  isLoading,
  onInviteClick,
  onRevoke,
}: GuestsTabContentProps) {
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Magic link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-none p-8 sm:p-12">
        <EmptyState
          icon={<Users className="w-8 h-8 text-[#9CA3AF]" />}
          title="No guest links created."
          description="Invite guest agents or parties to review the contract with a magic link."
          primaryActionLabel="Invite Guest"
          onPrimaryAction={onInviteClick}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F8F9FB]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
              <TableHead className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                Guest
              </TableHead>
              <TableHead className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                Expires
              </TableHead>
              <TableHead className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                Accessed
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => {
              const isExpired = guest.expiresAt
                ? new Date(guest.expiresAt) < new Date()
                : false;

              return (
                <TableRow
                  key={guest.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#F8F9FB] group"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#111827]">
                        {guest.guestName || "External User"}
                      </span>
                      <span className="text-[12px] text-[#6B7280]">
                        {guest.guestEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600 rounded-none text-[11px] font-normal px-2 py-0.5 border-none"
                      >
                        Expired
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 rounded-none text-[11px] font-normal px-2 py-0.5 border-none"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#4B5563]">
                    {guest.expiresAt
                      ? formatDistanceToNow(new Date(guest.expiresAt), {
                          addSuffix: true,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#4B5563]">
                    {guest.accessedAt
                      ? formatDistanceToNow(new Date(guest.accessedAt), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-white border border-transparent hover:border-[#E5E7EB] rounded-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-none border-[#E5E7EB] shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() => handleCopyLink(guest.url || "")}
                          className="text-[13px] py-2 cursor-pointer focus:bg-[#F8F9FB]"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(guest.url, "_blank")}
                          className="text-[13px] py-2 cursor-pointer focus:bg-[#F8F9FB]"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRevoke(guest.id!)}
                          className="text-[13px] py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
