"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Shield } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin area error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <AlertCircle className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-serif italic text-zinc-900">
            Admin Area Error
          </h1>
          <p className="text-zinc-500">
            We encountered an error in the admin panel. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-4 p-4 bg-zinc-100 rounded-none text-left">
              <p className="text-xs font-mono text-zinc-700 break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/admin/dashboard")}
            variant="outline"
            className="h-12 px-8 rounded-none"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
