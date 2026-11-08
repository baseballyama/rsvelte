import { reports } from '#lib/server/benchmark.ts';
import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	format: reports().plainA.population.tasks['svelte.format/default'],
	documents: reports().plainA.population.documents,
	benchRev: reports().plainA.build.rev,
	code: excerpts({
		severity: 'kernel/diagnostics/Severity',
		diagnostic: 'kernel/diagnostics/Diagnostic',
		unsupported: 'kernel/diagnostics/Unsupported',
		unsupportedImpl: 'kernel/diagnostics/impl Unsupported',
		format: 'svelte/format/task/Format::run',
	}),
});
