import { base } from "$app/paths";
import type { PageLoad } from "./$types";
import type { PerformanceReport } from "$lib/types/reports";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch(`${base}/performance-report.json`);
    if (!response.ok) {
      return {
        results: null,
        error: "Performance report not found. Run: npm run report:performance",
      };
    }
    const results: PerformanceReport = await response.json();
    return { results, error: null };
  } catch {
    return {
      results: null,
      error: "Failed to load the performance report. Run: npm run report:performance",
    };
  }
};
