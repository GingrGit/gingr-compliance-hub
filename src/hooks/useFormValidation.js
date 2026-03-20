import { useRef, useCallback } from "react";

/**
 * Scrolls to the first element with class "field-error" or data-error attribute.
 * Used to guide mobile users to the first invalid field.
 */
export function useScrollToError() {
  const containerRef = useRef(null);

  const scrollToFirstError = useCallback(() => {
    // Small timeout to allow DOM to update with error classes
    setTimeout(() => {
      const container = containerRef.current || document;
      const firstError =
        container.querySelector("[data-error='true']") ||
        container.querySelector(".border-red-400") ||
        container.querySelector(".field-error");

      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus the input inside if possible
        const input = firstError.querySelector("input, select, textarea, button");
        if (input) input.focus({ preventScroll: true });
      }
    }, 50);
  }, []);

  return { containerRef, scrollToFirstError };
}