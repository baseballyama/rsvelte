import { excerpts, sourceModule } from '#lib/server/source.ts';

export const load = () => ({
	docs: sourceModule('document_printer/lib').docs,
	code: excerpts({
		node: 'document_printer/lib/Node',
		lineKind: 'document_printer/lib/LineKind',
		docs: 'document_printer/lib/LayoutInstructions',
		text: 'document_printer/construct/LayoutInstructions::text',
		groupNode: 'document_printer/construct/LayoutInstructions::group_node',
		print: 'document_printer/printer/LayoutInstructions::print_inner',
		push: 'document_printer/construct/LayoutInstructions::push',
		measureOf: 'document_printer/construct/LayoutInstructions::measure_of',
		textParts: 'document_printer/construct/LayoutInstructions::text_parts',
		pooled: 'document_printer/lib/impl Default for LayoutInstructions',
		item: 'document_printer/printer/Item',
		run: 'document_printer/printer/Printer::run',
		chooseGroup: 'document_printer/printer/Printer::choose_group',
		fits: 'document_printer/printer/Printer::fits',
		fitsIn: 'document_printer/printer/Printer::fits_in',
		fill: 'document_printer/printer/Printer::fill',
		ifBreakBranch: 'document_printer/printer/Printer::if_break_branch',
		flatOnly: 'document_printer/construct/LayoutInstructions::flat_only',
		newline: 'document_printer/printer/Printer::newline',
		stringWidth: 'document_printer/width/string_width',
		setParts: 'document_printer/rewrite/LayoutInstructions::set_parts',
		trimLeft: 'document_printer/rewrite/LayoutInstructions::trim_left',
		removeLines: 'document_printer/rewrite/LayoutInstructions::remove_lines',
		builtBrokenTest: 'document_printer/tests/a_group_built_broken_breaks_its_parent',
		mustBeFlatTest:
			'document_printer/tests/fill_breaks_the_separator_after_content_holding_a_broken_group',
	}),
});
