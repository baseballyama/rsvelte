import { reports } from '$lib/server/benchmark';
import { excerpts } from '$lib/server/source';

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
		rule: 'kernel/diagnostics/rules/Rule',
		run: 'kernel/diagnostics/rules/impl Findings',
		rules: 'svelte/lint/lint/lint',
		noUnused: 'svelte/lint/lint/impl Rule for NoUnusedVariables',
		orderTest: 'kernel/diagnostics/rules/tests::findings_are_ordered_by_offset_and_ties_keep_rule_order',
		render: 'kernel/diagnostics/rules/render_json',
		columnsTest: 'kernel/diagnostics/rules/tests::columns_are_one_based_utf16'
	})
});
