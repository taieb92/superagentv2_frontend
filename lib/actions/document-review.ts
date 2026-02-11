"use server";

import { auth } from "@clerk/nextjs/server";

export async function sendDocumentReview(
  recipientEmail: string,
  title: string,
  data: Record<string, any>
) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    // Validate inputs
    if (!recipientEmail || !title) {
      return { success: false, error: "Email and title are required" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return { success: false, error: "Invalid email address" };
    }

    // Get the authentication token
    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      console.error("No authentication found");
      return {
        success: false,
        error: "Authentication required. Please sign in again.",
      };
    }

    // Get token - try Spring Boot template first, then fallback
    let token: string | null = null;
    try {
      token = await authResult.getToken({ template: "superagent-spring-boot" });
    } catch {
      try {
        token = await authResult.getToken();
      } catch {
        // Token fetch failed
      }
    }

    if (!token) {
      console.error(
        "Failed to get token from Clerk. User ID:",
        authResult.userId
      );
      return {
        success: false,
        error:
          "Failed to get authentication token. Please sign out and sign in again.",
      };
    }

    console.log(
      "Sending document review request to:",
      `${backendUrl}/documents/send-review`
    );

    const response = await fetch(`${backendUrl}/documents/send-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipientEmail,
        title,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      console.error("Document review error:", errorData);
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Document review exception:", error);
    return {
      success: false,
      error: error.message || "Failed to send document for review",
    };
  }
}
