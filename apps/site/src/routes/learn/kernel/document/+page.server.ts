import { excerpts, sourceModule } from '$lib/server/source';

export const load = () => ({
	docs: sourceModule('kernel/output/document').docs,
	code: excerpts({
		node: 'kernel/output/document/Node',
		lineKind: 'kernel/output/document/LineKind',
		docs: 'kernel/output/document/LayoutInstructions',
		text: 'kernel/output/document/LayoutInstructions::text',
		groupNode: 'kernel/output/document/LayoutInstructions::group_node',
		print: 'kernel/output/document/LayoutInstructions::print_inner',
		push: 'kernel/output/document/LayoutInstructions::push',
		breaksOf: 'kernel/output/document/LayoutInstructions::breaks_of',
		textParts: 'kernel/output/document/LayoutInstructions::text_parts',
		pooled: 'kernel/output/document/impl Default for LayoutInstructions',
		item: 'kernel/output/document/Item',
		run: 'kernel/output/document/Printer::run',
		chooseGroup: 'kernel/output/document/Printer::choose_group',
		fits: 'kernel/output/document/Printer::fits',
		fitsIn: 'kernel/output/document/Printer::fits_in',
		fill: 'kernel/output/document/Printer::fill',
		ifBreakBranch: 'kernel/output/document/Printer::if_break_branch',
		flatOnly: 'kernel/output/document/LayoutInstructions::flat_only',
		newline: 'kernel/output/document/Printer::newline',
		stringWidth: 'kernel/output/width/string_width',
		replaceParts: 'kernel/output/document/LayoutInstructions::replace_parts',
		trimLeft: 'kernel/output/document/LayoutInstructions::trim_left',
		removeLines: 'kernel/output/document/LayoutInstructions::remove_lines',
		builtBrokenTest: 'kernel/output/document/tests::a_group_built_broken_breaks_its_parent',
		mustBeFlatTest: 'kernel/output/document/tests::fill_breaks_the_separator_after_content_holding_a_broken_group'
	})
});
