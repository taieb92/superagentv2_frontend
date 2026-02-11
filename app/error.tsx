"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-serif italic text-zinc-900">
            Something went wrong
          </h1>
          <p className="text-zinc-500">
            We encountered an unexpected error. This has been logged and we'll
            look into it.
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
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="h-12 px-8 rounded-none"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
