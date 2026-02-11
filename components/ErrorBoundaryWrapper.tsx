"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * Client-side wrapper for ErrorBoundary to use in server components
 */
export function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
