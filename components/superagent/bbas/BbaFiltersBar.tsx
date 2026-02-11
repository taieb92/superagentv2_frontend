import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
interface BbaFiltersBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}
export function BbaFiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: BbaFiltersBarProps) {
  const hasActiveFilters = searchQuery || statusFilter !== "all";
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by buyer name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white border-zinc-200 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px] bg-white border-zinc-200">
            <Filter className="w-4 h-4 mr-2 text-zinc-400" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onSearchChange("");
              onStatusChange("all");
            }}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
