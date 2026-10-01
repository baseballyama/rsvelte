import counter from '$lib/data/emit/counter-client.json';
import plainA from '$lib/data/benchmark/plain-a.json';
import metricsA from '$lib/data/benchmark/metrics-a.json';
import { parity } from 'virtual:rsvelte-source';
import { crateSizes } from '$lib/server/source';

export const prerender = true;

export const load = () => {
	const alloc = (name: string) => {
		const a = metricsA.arms.find((x) => x.name === name);
		if (!a || typeof a.allocations !== 'number' || typeof a.peak_live_growth_bytes !== 'number') {
			throw new Error(`metrics-a.json has no allocation figures for arm ${name}`);
		}
		return a;
	};
	return {
		counter,
		crates: crateSizes(),
		parity,
		benchmark: {
			rev: plainA.build.rev,
			threads: plainA.threads,
			documents: plainA.population.documents,
			tasks: Object.values(plainA.population.tasks).filter((t) => t.ran > 0).length,
			bytes: plainA.population.bytes,
			rounds: plainA.rounds,
			arms: plainA.arms.map((a) => ({
				name: a.name,
				median: a.median_ms,
				peak: alloc(a.name).peak_live_growth_bytes,
				allocations: alloc(a.name).allocations
			}))
		}
	};
};
