import { arms, phaseTable, reports } from '$lib/server/bench';
import { baseline, paritySummary, perfHistory, PLATFORM } from '$lib/server/perf';
import { excerpts } from '$lib/server/source';

export const load = () => {
	const { plainA, metricsA } = reports();
	const b = baseline();
	return {
		perf: {
			population: b.population,
			allocs: b.allocs,
			allocBytes: b.alloc_bytes,
			peak: b.peak_live_growth_bytes,
			instructions: b.instructions[PLATFORM],
			load: b.load_instructions[PLATFORM],
			platform: PLATFORM,
			phases: Object.entries(b.phases)
				.map(([name, p]) => ({ name, ...p }))
				.sort((x, y) => y.allocs - x.allocs),
			last: perfHistory().at(-1)!
		},
		parity: paritySummary(),
		arms: arms(),
		phases: phaseTable(),
		population: plainA.population,
		build: plainA.build,
		threads: plainA.threads,
		rounds: plainA.rounds,
		maxRss: metricsA.max_rss_bytes,
		rawRounds: Object.fromEntries(plainA.arms.map((a) => [a.name, a.wall_ms])),
		code: excerpts({ doc: 'cli/bench/ARMS', perfDoc: 'cli/perf/measure' })
	};
};
