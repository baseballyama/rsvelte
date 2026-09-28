import { reports } from '$lib/server/bench';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	format: reports().plainA.population.tasks['svelte.format/default'],
	documents: reports().plainA.population.documents,
	code: excerpts({
		severity: 'kernel/diag/Severity',
		diagnostic: 'kernel/diag/Diagnostic',
		unsupported: 'kernel/diag/Unsupported',
		format: 'svelte/tasks/Format::run',
		rule: 'kernel/lint/Rule',
		run: 'kernel/lint/run',
		rules: 'svelte/lint/rules',
		noUnused: 'svelte/lint/impl Rule for NoUnusedVars',
		orderTest: 'kernel/lint/tests::findings_are_ordered_by_offset_and_ties_keep_rule_order',
		render: 'kernel/lint/render_json',
		columnsTest: 'kernel/lint/tests::columns_are_one_based_utf16'
	})
});
