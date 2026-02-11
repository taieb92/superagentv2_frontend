"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  setFetchFactory,
  setBaseUrl,
  getBaseUrl,
} from "@/lib/api/generated/fetch-client/helpers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Set base URL synchronously at module load - this ensures it's configured
// before any React Query hooks fire on first render
setBaseUrl(API_BASE_URL);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, signOut, userId } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      console.log("[AuthProvider] Clerk not loaded yet...");
      return;
    }

    // Log user ID when signed in
    if (isSignedIn && userId) {
      console.log("[AuthProvider] User logged in with ID:", userId);
    }

    // Configure the fetch factory to inject the token
    setFetchFactory(() => ({
      fetch: async (url: RequestInfo, init?: RequestInit) => {
        let token: string | null = null;

        if (isSignedIn) {
          try {
            token = await getToken();
          } catch (err) {
            console.error("[AuthProvider] Failed to get token:", err);
          }
        }

        const headers = new Headers(init?.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await fetch(url, {
          ...init,
          headers,
        });

        if (response.status === 401 || response.status === 403) {
          // Retry once with a fresh token (handles expired JWTs)
          try {
            const freshToken = await getToken({ skipCache: true });
            if (freshToken) {
              const retryHeaders = new Headers(init?.headers);
              retryHeaders.set("Authorization", `Bearer ${freshToken}`);
              const retryResponse = await fetch(url, {
                ...init,
                headers: retryHeaders,
              });
              if (retryResponse.ok) {
                return retryResponse;
              }
            }
          } catch {
            // Token refresh failed
          }

          // Don't sign out — let the caller handle the error.
          // Clerk's own session management will handle real session expiry.
          console.warn(
            `[AuthProvider] ${response.status} from ${typeof url === "string" ? url : (url as Request).url}`
          );
        }

        return response;
      },
    }));

    setIsConfigured(true);
  }, [getToken, isLoaded, isSignedIn, signOut, userId]);

  if (!isConfigured) {
    return null;
  }

  return <>{children}</>;
}
