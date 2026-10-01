import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		span: 'kernel/source/positions/Span',
		spanNew: 'kernel/source/positions/Span::new',
		location: 'kernel/source/positions/SourceLocation',
		locationSpan: 'kernel/source/positions/SourceLocation::span',
		synthetic: 'kernel/source/positions/SourceLocation::SYNTHETIC',
		max: 'kernel/source/positions/MAXIMUM_SOURCE_LENGTH',
		docNew: 'kernel/computation/pipeline/Document::new',
		lineIndex: 'kernel/source/positions/LineIndex',
		lineCol: 'kernel/source/positions/LineColumn',
		indexNew: 'kernel/source/positions/LineIndex::new',
		utf16: 'kernel/source/positions/LineIndex::utf16',
		offset: 'kernel/source/positions/LineIndex::offset',
		wide: 'kernel/source/positions/Wide',
		roundTest: 'kernel/source/positions/tests::an_offset_inside_a_character_rounds_down_to_its_start',
		reportEnd: 'javascript/check/parse_report'
	})
});
