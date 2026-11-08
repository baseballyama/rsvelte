import { excerpts, sourceModule } from '#lib/server/source.ts';

export const load = () => ({
	docs: sourceModule('document_printer/lib').docs,
	code: excerpts({
		node: 'document_printer/lib/Node',
		lineKind: 'document_printer/lib/LineKind',
		docs: 'document_printer/lib/LayoutInstructions',
		text: 'document_printer/lib/LayoutInstructions::text',
		groupNode: 'document_printer/lib/LayoutInstructions::group_node',
		print: 'document_printer/lib/LayoutInstructions::print_inner',
		push: 'document_printer/lib/LayoutInstructions::push',
		breaksOf: 'document_printer/lib/LayoutInstructions::breaks_of',
		textParts: 'document_printer/lib/LayoutInstructions::text_parts',
		pooled: 'document_printer/lib/impl Default for LayoutInstructions',
		item: 'document_printer/lib/Item',
		run: 'document_printer/lib/Printer::run',
		chooseGroup: 'document_printer/lib/Printer::choose_group',
		fits: 'document_printer/lib/Printer::fits',
		fitsIn: 'document_printer/lib/Printer::fits_in',
		fill: 'document_printer/lib/Printer::fill',
		ifBreakBranch: 'document_printer/lib/Printer::if_break_branch',
		flatOnly: 'document_printer/lib/LayoutInstructions::flat_only',
		newline: 'document_printer/lib/Printer::newline',
		stringWidth: 'document_printer/width/string_width',
		replaceParts: 'document_printer/lib/LayoutInstructions::replace_parts',
		trimLeft: 'document_printer/lib/LayoutInstructions::trim_left',
		removeLines: 'document_printer/lib/LayoutInstructions::remove_lines',
		builtBrokenTest: 'document_printer/lib/tests::a_group_built_broken_breaks_its_parent',
		mustBeFlatTest:
			'document_printer/lib/tests::fill_breaks_the_separator_after_content_holding_a_broken_group',
	}),
});
