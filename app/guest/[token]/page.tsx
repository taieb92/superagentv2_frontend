"use client";

import { useValidateGuestToken } from "@/lib/hooks/use-guest-links";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { GuestWorkspace } from "@/components/superagent/guest/GuestWorkspace";
import * as Types from "@/lib/api/generated/fetch-client";
import { useParams } from "next/navigation";

export default function GuestAccessPage() {
  const params = useParams();
  const token = params.token as string;

  const { mutate: validate, isPending, error } = useValidateGuestToken();
  const [session, setSession] = useState<Types.GuestLinkDto | null>(null);

  useEffect(() => {
    if (token && !session) {
      validate(token, {
        onSuccess: (data) => setSession(data),
      });
    }
  }, [token, validate, session]);

  if (isPending || (!session && !error)) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-gray-500 font-medium">Verifying access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            {(error as Error).message ||
              "The link you used is invalid or has expired."}
          </p>
          <div className="text-sm text-gray-400">
            Please contact the agent who sent you this link.
          </div>
        </div>
      </div>
    );
  }

  return <GuestWorkspace session={session!} />;
}
