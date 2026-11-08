import { excerpts } from '#lib/server/source.ts';

export const load = () => ({
	code: excerpts({
		rule: 'lint/rules/Rule',
		run: 'lint/rules/impl Findings',
		rules: 'svelte/lint/lint/lint',
		ruleImpl: 'svelte/lint/rules/impl Rule for RuleConfiguration',
		noUnused: 'svelte/lint/rules/no_unused_variables/check',
		orderTest: 'lint/rules/tests::findings_are_ordered_by_offset_and_ties_keep_rule_order',
		render: 'lint/output/render_json_with_rules',
		columnsTest: 'lint/output/tests::columns_are_one_based_utf16',
	}),
});
