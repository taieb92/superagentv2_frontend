export interface ParsedApiError {
  message: string;
  description?: string;
}

const GENERIC_MESSAGES = new Set([
  "An unexpected server error occurred.",
  "Invalid input / duplicate code",
]);

export function parseApiError(error: any): ParsedApiError {
  let result = error?.result;

  if (
    !result &&
    error &&
    typeof error === "object" &&
    "message" in error &&
    "error" in error &&
    !("result" in error)
  ) {
    result = error;
  }

  if (!result && typeof error?.response === "string") {
    try {
      result = JSON.parse(error.response);
    } catch {
      // ignore
    }
  }

  if (
    result?.errors &&
    Array.isArray(result.errors) &&
    result.errors.length > 0
  ) {
    return {
      message: result.message || "Validation Failed",
      description: result.errors.join(", "),
    };
  }

  if (result?.message && !GENERIC_MESSAGES.has(result.message)) {
    return { message: result.message };
  }

  if (error?.message && !GENERIC_MESSAGES.has(error.message)) {
    return { message: error.message };
  }

  return { message: "An unexpected error occurred. Please try again." };
}
