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
		rule: 'lint/rules/Rule',
		run: 'lint/rules/impl Findings',
		rules: 'svelte/lint/lint/lint',
		ruleImpl: 'svelte/lint/rules/impl Rule for RuleConfiguration',
		noUnused: 'svelte/lint/rules/no_unused_variables/check',
		orderTest: 'lint/rules/tests::findings_are_ordered_by_offset_and_ties_keep_rule_order',
		render: 'lint/output/render_json_with_rules',
		columnsTest: 'lint/output/tests::columns_are_one_based_utf16'
	})
});
