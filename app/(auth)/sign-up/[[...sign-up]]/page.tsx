"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignUp } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const hasInvite =
    searchParams.get("__clerk_invite_token") ||
    searchParams.get("__clerk_ticket") ||
    searchParams.get("__clerk_invitation_token");

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-linear-to-b from-zinc-50 to-slate-50 space-y-8">
      <div className="w-full max-w-md">
        {!hasInvite ? (
          <Alert
            variant="destructive"
            className="bg-white/50 border-red-100 backdrop-blur-sm shadow-xl rounded-2xl border"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Invite Required</AlertTitle>
            <AlertDescription className="text-zinc-600">
              SuperAgent is currently in invite-only beta. Please check your
              email for the invitation link.
            </AlertDescription>
          </Alert>
        ) : (
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-zinc-900 border-none hover:bg-zinc-800 text-sm normal-case",
                card: "border border-black/5 shadow-xl rounded-2xl",
                headerTitle: "font-serif italic text-2xl",
                headerSubtitle: "text-zinc-500",
                footer: "hidden",
              },
            }}
          />
        )}
      </div>

      {!hasInvite && (
        <a
          href="/sign-in"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Back to Sign In
        </a>
      )}
    </div>
  );
}
