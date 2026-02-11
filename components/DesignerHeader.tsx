"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DesignerHeader() {
  const router = useRouter();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Compass Studio
          </h1>
        </div>
      </div>
    </header>
  );
}
