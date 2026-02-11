/**
 * Hook for managing field-by-field navigation state.
 *
 * Tracks current index, handles next/prev with wrap-around,
 * and adjusts when the unfilled fields list changes (e.g., a field gets filled).
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { UnfilledField } from "./useUnfilledFields";

interface UseFieldNavigatorOptions {
  unfilledFields: UnfilledField[];
}

interface UseFieldNavigatorResult {
  currentIndex: number;
  currentField: UnfilledField | null;
  totalRemaining: number;
  goNext: () => void;
  goPrev: () => void;
  goToField: (name: string) => void;
  isActive: boolean;
}

export function useFieldNavigator({
  unfilledFields,
}: UseFieldNavigatorOptions): UseFieldNavigatorResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFieldNameRef = useRef<string | null>(null);

  // When unfilled fields list changes, try to stay on the same field by name
  useEffect(() => {
    if (unfilledFields.length === 0) {
      setCurrentIndex(0);
      currentFieldNameRef.current = null;
      return;
    }

    const prevName = currentFieldNameRef.current;
    if (prevName) {
      const newIdx = unfilledFields.findIndex((f) => f.name === prevName);
      if (newIdx >= 0) {
        setCurrentIndex(newIdx);
        return;
      }
    }

    // Field was filled (removed from list) or first render - clamp index
    setCurrentIndex((prev) => Math.min(prev, unfilledFields.length - 1));
  }, [unfilledFields]);

  // Keep ref in sync
  useEffect(() => {
    if (unfilledFields.length > 0 && currentIndex < unfilledFields.length) {
      currentFieldNameRef.current = unfilledFields[currentIndex].name;
    }
  }, [currentIndex, unfilledFields]);

  const goNext = useCallback(() => {
    if (unfilledFields.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % unfilledFields.length);
  }, [unfilledFields.length]);

  const goPrev = useCallback(() => {
    if (unfilledFields.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + unfilledFields.length) % unfilledFields.length
    );
  }, [unfilledFields.length]);

  const goToField = useCallback(
    (name: string) => {
      const idx = unfilledFields.findIndex((f) => f.name === name);
      if (idx >= 0) setCurrentIndex(idx);
    },
    [unfilledFields]
  );

  const currentField = useMemo(
    () =>
      unfilledFields.length > 0 && currentIndex < unfilledFields.length
        ? unfilledFields[currentIndex]
        : null,
    [unfilledFields, currentIndex]
  );

  return {
    currentIndex,
    currentField,
    totalRemaining: unfilledFields.length,
    goNext,
    goPrev,
    goToField,
    isActive: unfilledFields.length > 0,
  };
}
