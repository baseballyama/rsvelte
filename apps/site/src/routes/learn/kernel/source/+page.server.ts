import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		span: 'kernel/source/Span',
		spanNew: 'kernel/source/Span::new',
		loc: 'kernel/source/Loc',
		locSpan: 'kernel/source/Loc::span',
		synthetic: 'kernel/source/Loc::SYNTHETIC',
		max: 'kernel/source/MAX_SOURCE_LEN',
		docNew: 'kernel/pipeline/Document::new',
		lineIndex: 'kernel/source/LineIndex',
		lineCol: 'kernel/source/LineCol',
		indexNew: 'kernel/source/LineIndex::new',
		utf16: 'kernel/source/LineIndex::utf16',
		offset: 'kernel/source/LineIndex::offset'
	})
});
