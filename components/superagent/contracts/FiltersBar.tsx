"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
export function FiltersBar() {
  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Status Filter */}
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white border-zinc-200">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready for Review</SelectItem>
            <SelectItem value="sent">Sent for Signature</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {/* Search by Buyer */}
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by Buyer"
            className="pl-9 h-10 bg-white border-zinc-200"
          />
        </div>
        {/* Search by Address */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by Address/Property"
            className="pl-9 h-10 bg-white border-zinc-200"
          />
        </div>
        {/* Sort */}
        <Button
          variant="outline"
          className="h-10 border-zinc-200 text-zinc-600 bg-white w-full sm:w-auto"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" /> Newest First
        </Button>
      </div>
    </div>
  );
}
