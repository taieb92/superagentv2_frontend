"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteAdminDocument } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Download,
  FileText,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { DocumentDetailDto } from "@/lib/api/generated/fetch-client";


interface SignedContractsTableProps {
  documents: DocumentDetailDto[];
}

export function SignedContractsTable({ documents }: SignedContractsTableProps) {
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const filteredDocs = documents.filter(
    (doc) =>
      (doc.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.createdBy || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (url: string | null) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    // TODO: why we passing isDeleting as id?
    try {
      const result = await deleteAdminDocument(isDeleting);
      if (result.success) {
        toast.success("Document deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by title or agent email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-zinc-900"
        />
      </div>

      {/* Table */}
      <div className="rounded-none border border-black/5 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-black/5 hover:bg-transparent">
              <TableHead className="px-6 py-4 font-medium text-zinc-500">
                Document
              </TableHead>
              <TableHead className="px-6 py-4 font-medium text-zinc-500">
                Details
              </TableHead>
              <TableHead className="px-6 py-4 font-medium text-zinc-500">
                Sign Date
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-medium text-zinc-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-black/5">
            {filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-zinc-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-zinc-200" />
                    <p>No signed documents found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs
                .filter((doc) => doc.id)
                .map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="group hover:bg-zinc-50/50 border-black/5 transition-colors"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-zinc-900 rounded-none shadow-sm text-white shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 truncate max-w-[300px]">
                            {doc.title || "Untitled"}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 font-medium bg-zinc-100 text-zinc-500 border-none"
                            >
                              {doc.docType || "CONTRACT"}
                            </Badge>
                            <span>•</span>
                            <span className="truncate italic">
                              ID: {doc.id ? `${doc.id.slice(0, 8)}...` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-medium truncate max-w-[200px]">
                            {doc.createdBy || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "px-1.5 py-0 font-bold tracking-wider",
                              doc.status === "EXECUTED" ||
                                doc.status === "SIGNED" ||
                                doc.status === "SIGNED_FINAL"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                                : "bg-amber-50 text-amber-700 border-amber-100/50"
                            )}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-zinc-600 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {doc.signedAt
                          ? new Date(doc.signedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full px-4 border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                          onClick={() => handleDownload(doc.storagePath ?? null)}
                          disabled={!doc.storagePath}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full w-9 h-9 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          onClick={() => doc.id && setIsDeleting(doc.id)}
                          disabled={!doc.id || isDeleting === doc.id}
                        >
                          <Trash2
                            className={cn(
                              "h-4 w-4",
                              isDeleting === doc.id && "animate-pulse"
                            )}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!isDeleting}
        onOpenChange={(open) => !open && setIsDeleting(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-none !border-none shadow-2xl bg-white overflow-hidden p-0">
          <div className="bg-red-50/50 p-6 flex flex-col items-center justify-center gap-4 relative">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogHeader className="text-center sm:text-center space-y-2">
              <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">
                Delete Contract
              </DialogTitle>
              <DialogDescription className="text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                Are you sure you want to delete this contract? This action
                <span className="text-red-600 font-semibold underline decoration-red-200">
                  cannot be undone
                </span>
                .
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="p-6 pt-2 sm:flex-col gap-3">
            <Button
              type="button"
              variant="default"
              className="w-full rounded-none h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-none h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-semibold border-none shadow-none"
              onClick={() => setIsDeleting(null)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Summary */}
      <div className="text-xs text-zinc-400 px-1">
        Showing {filteredDocs.length} of {documents.length} signed contracts
      </div>
    </div>
  );
}
