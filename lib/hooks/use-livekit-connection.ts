"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface ConnectionDetails {
  token: string;
  url: string;
  roomName: string;
}

export interface UseLivekitConnectionReturn {
  connectionDetails: ConnectionDetails | null;
  isConnecting: boolean;
  error: string | null;
  startCall: () => Promise<void>;
  handleDisconnected: () => void;
}

export function useLivekitConnection(
  guestToken?: string
): UseLivekitConnectionReturn {
  const { userId, getToken } = useAuth();
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async () => {
    if (!userId && !guestToken) {
      const msg = "User ID or Guest Token is required to connect";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isConnecting || connectionDetails) return;

    try {
      setIsConnecting(true);
      setError(null);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

      const clerkJwt = await getToken();

      const res = await fetch(`${baseUrl}/v1/livekit/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clerkJwt ? { Authorization: `Bearer ${clerkJwt}` } : {}),
        },
        body: JSON.stringify({
          userId: guestToken ? `guest_${guestToken.substring(0, 8)}` : userId,
          participantName: "User",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Token request failed (${res.status})`);
      }

      const data = await res.json();
      console.log("[useLivekitConnection] Token response:", JSON.stringify(data));

      if (!data.token || !data.url) {
        throw new Error("Invalid token response");
      }

      // Backend may return room_name (snake_case) or roomName (camelCase)
      const roomName = data.roomName || data.room_name;

      setConnectionDetails({
        token: data.token,
        url: data.url,
        roomName,
      });
    } catch (err: any) {
      const msg = err.message || "Failed to start voice call";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [userId, guestToken, isConnecting, connectionDetails, getToken]);

  const handleDisconnected = useCallback(() => {
    setConnectionDetails(null);
    setError(null);
  }, []);

  return {
    connectionDetails,
    isConnecting,
    error,
    startCall,
    handleDisconnected,
  };
}
