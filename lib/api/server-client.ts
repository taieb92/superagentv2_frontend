/**
 * Server-safe API Client
 *
 * Creates an authenticated instance of the API Client for use in Server Components.
 * Since we've removed the Query re-export from fetch-client.ts, it's now safe to
 * import the Client class directly.
 */

import { Client } from "@/lib/api/generated/fetch-client";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

/**
 * Creates an authenticated instance of the API Client for use in Server Components.
 * Automatically injects the current user's token and uses the configured Base URL.
 */
export async function getServerClient(): Promise<Client> {
  const { getToken } = await auth();
  const token = await getToken();

  return new Client(API_BASE_URL, {
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return fetch(url, { ...init, headers, cache: "no-store" });
    },
  });
}
