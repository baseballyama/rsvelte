import { excerpts, sourceModule } from '#lib/server/source.ts';

export const load = () => ({
	docs: sourceModule('document_printer/lib').docs,
	code: excerpts({
		node: 'document_printer/lib/Node',
		lineKind: 'document_printer/lib/LineKind',
		docs: 'document_printer/lib/LayoutInstructions',
		text: 'document_printer/construct/LayoutInstructions::text',
		textParts: 'document_printer/construct/LayoutInstructions::text_parts',
		pooled: 'document_printer/lib/impl Default for LayoutInstructions',
		lower: 'document_printer/lower/LayoutInstructions::lower',
		lowerNode: 'document_printer/lower/Lowering::node',
		lineMode: 'document_printer/lower/line_mode',
		hardlineTest: 'document_printer/tests/hardline_breaks_enclosing_groups',
		keep: 'document_printer/embedding/Embedding::keep',
		print: 'document_printer/embedding/Embedding::print',
		setParts: 'document_printer/rewrite/LayoutInstructions::set_parts',
	}),
});
