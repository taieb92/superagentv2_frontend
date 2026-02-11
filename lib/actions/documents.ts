"use server";

import { auth } from "@clerk/nextjs/server";

interface CreateDocumentData {
  title: string;
  docType?: string;
  data?: Record<string, any>;
}

interface SendEmailData {
  recipientEmail: string;
  emailBody: string;
}

export async function createDocument(data: CreateDocumentData) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      return { success: false, error: "Authentication required" };
    }

    let token: string | null = null;
    try {
      token = await authResult.getToken();
    } catch (tokenError: any) {
      console.error("Error getting token:", tokenError);
      return { success: false, error: "Failed to get authentication token" };
    }

    if (!token) {
      return { success: false, error: "Failed to get authentication token" };
    }

    const response = await fetch(`${backendUrl}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const document = await response.json();
    return { success: true, document };
  } catch (error: any) {
    console.error("Create document exception:", error);
    return {
      success: false,
      error: error.message || "Failed to create document",
    };
  }
}

export async function sendDocumentEmail(
  documentId: string,
  emailData: SendEmailData
) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      return { success: false, error: "Authentication required" };
    }

    let token: string | null = null;
    try {
      token = await authResult.getToken();
    } catch (tokenError: any) {
      console.error("Error getting token:", tokenError);
      return { success: false, error: "Failed to get authentication token" };
    }

    if (!token) {
      return { success: false, error: "Failed to get authentication token" };
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.recipientEmail)) {
      return { success: false, error: "Invalid email address" };
    }

    if (!emailData.emailBody || emailData.emailBody.trim().length === 0) {
      return { success: false, error: "Email body is required" };
    }

    const response = await fetch(
      `${backendUrl}/v1/documents/${documentId}/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientEmail: emailData.recipientEmail,
          emailBody: emailData.emailBody,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      console.error("Document email error:", errorData);
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Send document email exception:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

interface SignerData {
  email: string;
  name: string;
  role: string;
  routingOrder: number;
  anchorStrings: string[];
}

interface SendForSignatureData {
  signers: SignerData[];
  emailSubject: string;
  emailBody?: string;
}

export async function sendDocumentForSignature(
  documentId: string,
  signatureData: SendForSignatureData
) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      return { success: false, error: "Authentication required" };
    }

    let token: string | null = null;
    try {
      token = await authResult.getToken();
    } catch (tokenError: any) {
      console.error("Error getting token:", tokenError);
      return { success: false, error: "Failed to get authentication token" };
    }

    if (!token) {
      return { success: false, error: "Failed to get authentication token" };
    }

    // Validate signers
    if (!signatureData.signers || signatureData.signers.length === 0) {
      return { success: false, error: "At least one signer is required" };
    }

    for (const signer of signatureData.signers) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email)) {
        return {
          success: false,
          error: `Invalid email for signer: ${signer.name}`,
        };
      }
      if (!signer.anchorStrings || signer.anchorStrings.length === 0) {
        return {
          success: false,
          error: `No anchor strings provided for signer: ${signer.name}`,
        };
      }
    }

    const response = await fetch(
      `${backendUrl}/v1/documents/${documentId}/send-for-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(signatureData),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      console.error("Send for signature error:", errorData);
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Send for signature exception:", error);
    return {
      success: false,
      error: error.message || "Failed to send document for signature",
    };
  }
}

export async function getDocument(documentId: string) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      return { success: false, error: "Authentication required" };
    }
    let token: string | null = null;
    try {
      token = await authResult.getToken();
    } catch (tokenError: any) {
      console.error("Error getting token:", tokenError);
      return { success: false, error: "Failed to get authentication token" };
    }

    if (!token) {
      return { success: false, error: "Failed to get authentication token" };
    }

    const response = await fetch(`${backendUrl}/v1/documents/${documentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const document = await response.json();
    return { success: true, document };
  } catch (error: any) {
    console.error("Get document exception:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch document",
    };
  }
}
export async function deleteAdminDocument(documentId: string) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      return { success: false, error: "Authentication required" };
    }

    let token: string | null = null;
    try {
      token = await authResult.getToken();
    } catch (tokenError: any) {
      console.error("Error getting token:", tokenError);
      return { success: false, error: "Failed to get authentication token" };
    }

    const response = await fetch(
      `${backendUrl}/v1/admin/documents/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete document exception:", error);
    return {
      success: false,
      error: error.message || "Failed to delete document",
    };
  }
}
