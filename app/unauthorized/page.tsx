"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    // Sign out the user and redirect to landing page
    const handleSignOut = async () => {
      await signOut();
      router.replace("/");
    };

    handleSignOut();
  }, [router, signOut]);

  return null;
}
