import { corpus } from '$lib/data/status';
import { arms, phaseTable, reports } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => {
	const { plainA, metricsA } = reports();
	return {
		arms: arms(),
		phases: phaseTable(),
		population: plainA.population,
		build: plainA.build,
		metricsBuild: metricsA.build,
		threads: plainA.threads,
		rounds: plainA.rounds,
		maxRss: metricsA.max_rss_bytes,
		rawRounds: Object.fromEntries(plainA.arms.map((a) => [a.name, a.wall_ms])),
		corpus,
		code: excerpts({ doc: 'cli/bench/ARMS' })
	};
};
