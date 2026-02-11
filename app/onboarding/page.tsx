"use client";

import { Button } from "@/components/ui/button";
import { OnboardingForm } from "@/components/superagent/onboarding/OnboardingForm";
import { useClerk, useUser } from "@clerk/nextjs";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.publicMetadata?.onboarded) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [user, isLoaded, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-zinc-50 to-slate-50">
        <Loader2 className="h-10 w-10 text-zinc-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
          className="absolute right-4 top-4 z-10 text-zinc-200 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        <div className="relative mb-12 h-48 bg-zinc-900 rounded-3xl flex items-center justify-center overflow-hidden">
          <div className="relative flex flex-col items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif italic text-white">
              Complete Your Profile
            </h1>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          <OnboardingForm
            userId={user.id}
            onComplete={() => router.push("/dashboard")}
          />
        </div>
      </div>
    </div>
  );
}
