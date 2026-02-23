import { useCallback } from "react";

/**
 * Hook to trigger file downloads from export URLs.
 */
export function useExport() {
  const triggerExport = useCallback((url: string) => {
    // Open in a new tab / trigger download
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { triggerExport };
}
