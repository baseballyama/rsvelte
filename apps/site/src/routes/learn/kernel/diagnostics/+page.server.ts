import { reports } from '#lib/server/benchmark.ts';
import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	format: reports().plainA.population.tasks['svelte.format/default'],
	documents: reports().plainA.population.documents,
	benchRev: reports().plainA.build.rev,
	code: excerpts({
		severity: 'kernel/diagnostics/diagnostic/Severity',
		diagnostic: 'kernel/diagnostics/diagnostic/Diagnostic',
		unsupported: 'kernel/diagnostics/diagnostic/Unsupported',
		unsupportedImpl: 'kernel/diagnostics/diagnostic/impl Unsupported',
		format: 'svelte/format/task/Format::run',
	}),
});
