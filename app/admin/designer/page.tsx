"use client";

import { JurisdictionsTable } from "@/components/superagent/designer/JurisdictionsTable";
import { AdminShell } from "@/components/superagent/shell/AdminShell";
import { PageHeader } from "@/components/superagent/ui/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  JurisdictionResponseDto,
  JurisdictionRequestDto,
} from "@/lib/api/generated/fetch-client";
import {
  useGetAllJurisdictionsQuery,
  useCreateJurisdictionMutation,
} from "@/lib/api/generated/fetch-client/Query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useState } from "react";
import { parseApiError } from "@/lib/api/error-handler";

export default function JurisdictionSelectorPage() {
  const [newJurisdictionName, setNewJurisdictionName] = useState("");
  const [newJurisdictionCode, setNewJurisdictionCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Use generated query
  const { data: jurisdictionsData, isLoading } = useGetAllJurisdictionsQuery();

  // Use generated mutation
  const createJurisdiction = useCreateJurisdictionMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jurisdictions"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Jurisdiction created successfully");

      setNewJurisdictionName("");
      setNewJurisdictionCode("");
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const parsedError = parseApiError(error);
      const errorMessage = parsedError.message || "Unknown error";
      toast.error(errorMessage);
    },
  });

  const jurisdictions: JurisdictionResponseDto[] =
    (jurisdictionsData as JurisdictionResponseDto[]) || [];

  const handleAddJurisdiction = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newJurisdictionName.trim();
    const trimmedCode = newJurisdictionCode.trim().toUpperCase();

    if (!trimmedName) {
      toast.error("State Name is required.");
      return;
    }

    if (!trimmedCode) {
      toast.error("State Code is required.");
      return;
    }

    if (trimmedCode.length !== 2) {
      toast.error("State Code must be exactly 2 characters.");
      return;
    }

    if (!/^[A-Z]{2}$/.test(trimmedCode)) {
      toast.error("State Code must be 2 uppercase letters.");
      return;
    }

    const request = new JurisdictionRequestDto({
      code: trimmedCode,
      name: trimmedName,
    });
    createJurisdiction.mutate(request);
  };

  return (
    <AdminShell>
      <div className="max-w-[1280px] mx-auto space-y-8">
        <PageHeader
          title="Jurisdictions"
          subtitle="Manage states and document templates"
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0F766E] hover:bg-[#115E59] text-white gap-2 h-10 px-4 rounded-[6px] shadow-sm">
                  <Plus className="h-4 w-4" /> Add Jurisdiction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[10px]">
                <DialogHeader>
                  <DialogTitle className="text-[18px] font-semibold">
                    Add New Jurisdiction
                  </DialogTitle>
                  <DialogDescription className="text-[14px]">
                    Create a new state or region to manage its templates.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleAddJurisdiction}
                  className="space-y-6 pt-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-[12px] font-medium text-[#6B7280]"
                      >
                        State Name
                      </Label>
                      <Input
                        id="name"
                        value={newJurisdictionName}
                        onChange={(e) => setNewJurisdictionName(e.target.value)}
                        placeholder="e.g. California"
                        className="h-11 rounded-[6px] border-[#E5E7EB] focus-visible:ring-[#0F766E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="code"
                        className="text-[12px] font-medium text-[#6B7280]"
                      >
                        State Code
                      </Label>
                      <Input
                        id="code"
                        value={newJurisdictionCode}
                        onChange={(e) =>
                          setNewJurisdictionCode(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. CA"
                        maxLength={2}
                        className="h-11 rounded-[6px] border-[#E5E7EB] focus-visible:ring-[#0F766E] uppercase"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full bg-[#111827] hover:bg-black text-white h-11 rounded-[6px]"
                      disabled={createJurisdiction.isPending}
                    >
                      {createJurisdiction.isPending
                        ? "Creating..."
                        : "Create Jurisdiction"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="space-y-6">
          <JurisdictionsTable
            jurisdictions={jurisdictions}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminShell>
  );
}
