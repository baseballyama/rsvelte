import { excerpts, sourceModule } from '$lib/server/source';

export const load = () => ({
	docs: sourceModule('kernel/doc').docs,
	code: excerpts({
		node: 'kernel/doc/Node',
		lineKind: 'kernel/doc/LineKind',
		docs: 'kernel/doc/Docs',
		text: 'kernel/doc/Docs::text',
		groupNode: 'kernel/doc/Docs::group_node',
		print: 'kernel/doc/Docs::print',
		breaks: 'kernel/doc/Docs::breaks',
		item: 'kernel/doc/Item',
		run: 'kernel/doc/Printer::run',
		fits: 'kernel/doc/Printer::fits',
		fill: 'kernel/doc/Printer::fill',
		ifBreakBranch: 'kernel/doc/Printer::if_break_branch',
		flatOnly: 'kernel/doc/Docs::flat_only',
		newline: 'kernel/doc/Printer::newline',
		stringWidth: 'kernel/doc/string_width',
		replaceParts: 'kernel/doc/Docs::replace_parts',
		trimLeft: 'kernel/doc/Docs::trim_left',
		removeLines: 'kernel/doc/Docs::remove_lines',
		mustBeFlatTest: 'kernel/doc/tests::fill_breaks_the_separator_after_content_holding_a_broken_group'
	})
});
