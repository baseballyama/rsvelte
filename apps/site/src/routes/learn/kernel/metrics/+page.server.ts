import { arms, phaseAverages, reports } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	avg: phaseAverages(),
	benchRev: reports().metricsA.build.rev,
	arms: arms(),
	code: excerpts({
		counted: 'kernel/metrics/counted',
		alloc: 'kernel/metrics/impl GlobalAlloc for CountingAlloc',
		stats: 'kernel/metrics/PhaseStats',
		frame: 'kernel/metrics/imp::Frame',
		phase: 'kernel/metrics/imp::phase',
		drop: 'kernel/metrics/imp::PhaseGuard::drop',
		snapshot: 'kernel/metrics/imp::snapshot',
		trackGlobal: 'kernel/metrics/track_global',
		global: 'kernel/metrics/global',
		off: 'kernel/metrics/imp#2'
	})
});
