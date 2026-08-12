import { base } from "$app/paths";
import type { PageLoad } from "./$types";
import type { CompatibilityReport } from "$lib/types/reports";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch(`${base}/compatibility-report.json`);
    if (!response.ok) {
      return { compatibility: null, error: "Compatibility report not found." };
    }
    const compatibility: CompatibilityReport = await response.json();
    return { compatibility, error: null };
  } catch {
    return { compatibility: null, error: "Failed to load the compatibility report." };
  }
};
