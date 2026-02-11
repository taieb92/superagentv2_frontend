"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

interface OnboardingModalProps {
  readonly userId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function OnboardingModal({
  userId,
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const router = useRouter();

  const handleComplete = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border border-[#E5E7EB] shadow-xl bg-white rounded-none">
        <div className="relative h-24 bg-gradient-to-br from-[#0F766E] to-[#0D6B63] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent blur-2xl" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-none backdrop-blur-md border border-white/20 text-white transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex flex-col items-center gap-2">
            <div className="p-3 bg-white/10 rounded-none backdrop-blur-md border border-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#111827]">
              Complete Your Profile
            </DialogTitle>
            <DialogDescription className="text-[#6B7280] mt-2">
              Welcome to SuperAgent! Let's get you set up in a few simple steps.
            </DialogDescription>
          </DialogHeader>

          <OnboardingForm userId={userId} onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
