"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t border-[#E5E7EB] bg-white">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-[6px] border-[#E5E7EB]"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentPage === totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-[6px] border-[#E5E7EB]"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] text-[#6B7280]">
            Showing page
            <span className="font-semibold text-[#111827]">
              {currentPage + 1}
            </span>
            of
            <span className="font-semibold text-[#111827]">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-[6px] shadow-sm"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center rounded-l-[6px] px-2 py-2 text-[#6B7280] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="flex items-center px-4">
              <span className="text-[13px] font-medium text-[#111827]">
                {currentPage + 1} / {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center rounded-r-[6px] px-2 py-2 text-[#6B7280] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
