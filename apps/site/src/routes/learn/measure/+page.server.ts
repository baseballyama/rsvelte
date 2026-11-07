import { arms, phaseTable, reports } from '#lib/server/benchmark.ts';
import { baseline, paritySummary, performanceHistory, PLATFORM } from '#lib/server/performance.ts';
import { excerpts } from '#lib/server/source.ts';

export const load = () => {
	const { plainA, metricsA } = reports();
	const b = baseline();
	return {
		performance: {
			population: b.population,
			allocations: b.allocations,
			allocBytes: b.alloc_bytes,
			peak: b.peak_live_growth_bytes,
			instructions: b.instructions[PLATFORM],
			load: b.load_instructions[PLATFORM],
			// The instructions count a sample of the documents; per byte divides by its bytes.
			instructionSample: b.instruction_sample ?? {
				every: 1,
				documents: b.population.documents,
				source_bytes: b.population.source_bytes,
			},
			platform: PLATFORM,
			phases: Object.entries(b.phases)
				.map(([name, { calls, allocations, alloc_bytes }]) => ({
					name,
					calls,
					allocations,
					alloc_bytes,
				}))
				.toSorted((x, y) => y.allocations - x.allocations),
			last: performanceHistory().at(-1)!,
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
		code: excerpts({
			doc: 'command_line/commands/benchmark/ARMS',
			perfDoc: 'command_line/commands/performance/measure',
		}),
	};
};
