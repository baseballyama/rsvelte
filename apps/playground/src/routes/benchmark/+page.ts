import { base } from "$app/paths";
import type { PageLoad } from "./$types";
import type { PerformanceReport, PrinterBenchmarks } from "$lib/types/reports";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch(`${base}/performance-report.json?refresh=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        results: null,
        error: "Performance report not found. Run: npm run report:performance",
      };
    }
    const results: PerformanceReport = await response.json();
    if (!results.printerBenchmarks) {
      const printerResponse = await fetch(
        `${base}/printer-performance-report.json?refresh=${Date.now()}`,
        { cache: "no-store" },
      );
      if (printerResponse.ok) {
        results.printerBenchmarks = (await printerResponse.json()) as PrinterBenchmarks;
      }
    }
    return { results, error: null };
  } catch {
    return {
      results: null,
      error: "Failed to load the performance report. Run: npm run report:performance",
    };
  }
};
