"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import * as Types from "@/lib/api/generated/fetch-client";

interface GuestInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: Types.GuestLinkCreateRequest) => void;
  isCreating?: boolean;
}

export function GuestInviteModal({
  open,
  onOpenChange,
  onSubmit,
  isCreating = false,
}: GuestInviteModalProps) {
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [expirationHours, setExpirationHours] = useState("72");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail) return;

    onSubmit(
      new Types.GuestLinkCreateRequest({
        guestEmail,
        guestName: guestName || undefined,
        expirationHours: parseInt(expirationHours) || 72,
      })
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setGuestEmail("");
      setGuestName("");
      setExpirationHours("72");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-[#E5E7EB] shadow-xl bg-white rounded-none">
        <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[18px] font-semibold text-[#111827]">
            Invite Guest
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B7280]">
            Send a magic link to a guest to review the contract.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#374151]">
                Guest Email
              </Label>
              <Input
                required
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@example.com"
                className="h-10 border-[#E5E7EB] rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#374151]">
                Guest Name{" "}
                <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Doe"
                className="h-10 border-[#E5E7EB] rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-[#374151]">
                Expiration (hours)
              </Label>
              <Input
                type="number"
                min="1"
                max="720"
                value={expirationHours}
                onChange={(e) => setExpirationHours(e.target.value)}
                className="h-10 border-[#E5E7EB] rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
              <p className="text-[11px] text-[#9CA3AF]">
                Default is 72 hours (3 days)
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
              className="h-10 px-4 border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FB] rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!guestEmail || isCreating}
              className="h-10 px-4 bg-[#0F766E] text-white hover:bg-[#0F766E]/90 rounded-none min-w-[120px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Link"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
