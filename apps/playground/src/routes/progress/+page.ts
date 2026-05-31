import { base } from '$app/paths';
import type { PageLoad } from './$types';
import type { TestResults } from '$lib/types/test-results';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`${base}/test-results.json`);

		if (!response.ok) {
			return {
				results: null,
				error:
					'Test results not available. Run: cargo run --release --bin test_reporter -- --output apps/playground/static/test-results.json'
			};
		}

		const results: TestResults = await response.json();
		return { results, error: null };
	} catch {
		return {
			results: null,
			error:
				'Failed to load test results. Run: cargo run --release --bin test_reporter -- --output apps/playground/static/test-results.json'
		};
	}
};
