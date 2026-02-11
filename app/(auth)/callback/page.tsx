"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function CallbackPage() {
  const { user, isLoaded } = useUser();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !isLoaded) return;

    if (!user) {
      done.current = true;
      globalThis.location.href = "/sign-in";
      return;
    }

    done.current = true;

    const role = user.publicMetadata?.role as string;
    const onboarded = user.publicMetadata?.onboarded as boolean;

    // Redirect based on role and onboarding status
    if (role === "ADMIN") {
      globalThis.location.href = "/admin/dashboard";
    } else if (onboarded) {
      globalThis.location.href = "/dashboard";
    } else {
      globalThis.location.href = "/onboarding";
    }
  }, [isLoaded, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-zinc-50 to-slate-50">
      <Loader2 className="h-10 w-10 text-zinc-900 animate-spin" />
    </div>
  );
}
