"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TemplateListDto as TemplateListItem } from "@/lib/api/generated/fetch-client";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Search } from "lucide-react";
import { useState } from "react";

interface AddendumSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addenda: TemplateListItem[];
  isLoading: boolean;
  onSelect: (addendum: TemplateListItem) => void;
  isCreating?: boolean;
}

export function AddendumSelectModal({
  open,
  onOpenChange,
  addenda,
  isLoading,
  onSelect,
  isCreating = false,
}: AddendumSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAddenda = addenda.filter((addendum) =>
    (addendum.title || addendum.slug || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-[#E5E7EB] shadow-xl bg-white rounded-none">
        <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[18px] font-semibold text-[#111827]">
            Select Addendum Template
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B7280]">
            Choose an addendum template to add to this purchase contract.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Search addenda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-[#E5E7EB] focus:ring-[#0F766E]/5 focus:border-[#0F766E] rounded-none"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
            </div>
          ) : filteredAddenda.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-[14px] font-semibold text-[#111827] mb-1">
                {searchQuery
                  ? "No addenda found"
                  : "No addenda templates available"}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {searchQuery
                  ? "Try a different search term"
                  : "Addenda templates need to be configured for this jurisdiction"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAddenda.map((addendum) => (
                <button
                  key={addendum.id}
                  onClick={() => onSelect(addendum)}
                  disabled={isCreating}
                  className={cn(
                    "w-full text-left p-4 border border-[#E5E7EB] rounded-none transition-all",
                    "hover:border-[#0F766E]/30 hover:bg-[#ECFDF5]/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-[#0F766E] shrink-0" />
                        <h3 className="text-[14px] font-semibold text-[#111827] truncate">
                          {addendum.title ||
                            addendum.slug ||
                            "Untitled Addendum"}
                        </h3>
                      </div>
                      {addendum.slug && (
                        <p className="text-[12px] text-[#6B7280] truncate">
                          {addendum.slug}
                        </p>
                      )}
                      {addendum.documentPrompt && (
                        <p className="text-[12px] text-[#9CA3AF] mt-1 line-clamp-2">
                          {addendum.documentPrompt}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className="h-10 px-4 border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FB] rounded-none"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
