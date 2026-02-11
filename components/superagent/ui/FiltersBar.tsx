"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function FiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border border-[#E5E7EB] shadow-sm rounded-none">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
        <Input
          placeholder="Search by address or buyer name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 border-[#E5E7EB] focus:ring-[#0F766E]/5 focus:border-[#0F766E] rounded-none"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] h-10 border-[#E5E7EB] rounded-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="WAITING">Waiting Signature</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px] h-10 border-[#E5E7EB] rounded-none">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Date Created</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
