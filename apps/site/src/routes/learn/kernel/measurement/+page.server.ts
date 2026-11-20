import { arms, phaseAverages, reports } from '#lib/server/benchmark.ts';
import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	avg: phaseAverages(),
	benchRev: reports().metricsA.build.rev,
	arms: arms(),
	code: excerpts({
		counted: 'kernel/performance/measurement/counted',
		alloc: 'kernel/performance/measurement/impl GlobalAlloc for CountingAllocator',
		stats: 'kernel/performance/measurement/PhaseMeasurements',
		frame: 'kernel/performance/measurement/phases/Frame',
		phase: 'kernel/performance/measurement/phases/phase',
		guard: 'kernel/performance/measurement/phases/PhaseGuard',
		notSend: 'kernel/performance/measurement/_',
		drop: 'kernel/performance/measurement/phases/PhaseGuard::drop',
		snapshot: 'kernel/performance/measurement/phases/snapshot',
		trackGlobal: 'kernel/performance/measurement/track_global',
		global: 'kernel/performance/measurement/global',
		offGuard: 'kernel/performance/measurement/phases_disabled/PhaseGuard',
		off: 'kernel/performance/measurement/phases_disabled/phase',
	}),
});
