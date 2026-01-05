import type { PageLoad } from './$types';
import type { BenchmarkResults } from '$lib/types/benchmark';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/benchmark-results.json');
		if (!response.ok) {
			return {
				results: null,
				error: 'Benchmark results not found. Run the benchmark script to generate results.'
			};
		}
		const results: BenchmarkResults = await response.json();
		return { results, error: null };
	} catch {
		return {
			results: null,
			error: 'Failed to load benchmark results. Run the benchmark script to generate results.'
		};
	}
};
