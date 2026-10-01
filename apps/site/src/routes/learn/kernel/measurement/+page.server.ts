import { arms, phaseAverages, reports } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	avg: phaseAverages(),
	benchRev: reports().metricsA.build.rev,
	arms: arms(),
	code: excerpts({
		counted: 'kernel/performance/measurement/counted',
		alloc: 'kernel/performance/measurement/impl GlobalAlloc for CountingAllocator',
		stats: 'kernel/performance/measurement/PhaseMeasurements',
		frame: 'kernel/performance/measurement/imp::Frame',
		phase: 'kernel/performance/measurement/imp::phase',
		guard: 'kernel/performance/measurement/imp::PhaseGuard',
		notSend: 'kernel/performance/measurement/_',
		drop: 'kernel/performance/measurement/imp::PhaseGuard::drop',
		snapshot: 'kernel/performance/measurement/imp::snapshot',
		trackGlobal: 'kernel/performance/measurement/track_global',
		global: 'kernel/performance/measurement/global',
		off: 'kernel/performance/measurement/imp#2'
	})
});
